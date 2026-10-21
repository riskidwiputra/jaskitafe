"use client";
import Link from "next/link";
import {useEffect,useRef,useState} from "react";
import UlasanBrand from "@/components/UlasanBrand";
import { useParams, useRouter } from "next/navigation";
const API=process.env.NEXT_PUBLIC_API_URL;
const LABEL=["","Sangat kecewa","Kurang puas","Cukup","Puas","Sangat puas"];
const MAX_PHOTOS=5,MAX_ORIGINAL_SIZE=20*1024*1024,MAX_UPLOAD_SIZE=300*1024,MAX_DIMENSION=1280;
function canvasBlob(canvas,quality){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("Foto gagal diproses.")),"image/jpeg",quality))}
async function compressImage(file){
 const image=await createImageBitmap(file);
 try{
  if(file.size<=MAX_UPLOAD_SIZE&&image.width<=MAX_DIMENSION&&image.height<=MAX_DIMENSION)return file;
  let scale=Math.min(1,MAX_DIMENSION/image.width,MAX_DIMENSION/image.height),quality=.82,blob;
  const canvas=document.createElement("canvas"),context=canvas.getContext("2d");
  if(!context)throw new Error("Browser tidak mendukung pemrosesan foto.");
  for(let attempt=0;attempt<12;attempt++){
   canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));
   context.fillStyle="#fff";context.fillRect(0,0,canvas.width,canvas.height);
   context.drawImage(image,0,0,canvas.width,canvas.height);
   blob=await canvasBlob(canvas,quality);
   if(blob.size<MAX_UPLOAD_SIZE)break;
   if(quality>.4)quality=Math.max(.4,quality-.08);
   else scale*=.85;
  }
  if(!blob||blob.size>MAX_UPLOAD_SIZE)throw new Error("Foto gagal diperkecil hingga maksimal 300 KB. Coba pilih foto lain.");
  return new File([blob],`${file.name.replace(/\.[^.]+$/,"")}.jpg`,{type:"image/jpeg",lastModified:Date.now()});
 }finally{image.close()}
}
function formatSize(size){return size<1024*1024?`${Math.round(size/1024)} KB`:`${(size/1024/1024).toFixed(1)} MB`}
export default function FormUlasan(){const {token}=useParams();const router=useRouter();const [info,setInfo]=useState(null),[rating,setRating]=useState(0),[text,setText]=useState(""),[files,setFiles]=useState([]),[err,setErr]=useState(""),[busy,setBusy]=useState(false),[compressing,setCompressing]=useState(false);const previewUrls=useRef(new Set()),compressingRef=useRef(false);
 useEffect(()=>{fetch(`${API}/public/ulasan/${token}`).then(async r=>{const b=await r.json();if(!r.ok)throw Error(b.error||"Link tidak valid");if(b.data.review){setRating(b.data.review.rating);setText(b.data.review.kritik_saran)}setInfo(b.data)}).catch(e=>setErr(e.message))},[token]);
 useEffect(()=>()=>previewUrls.current.forEach(url=>URL.revokeObjectURL(url)),[]);
 async function addFiles(list){if(compressingRef.current)return;compressingRef.current=true;setErr("");setCompressing(true);try{const accepted=[];for(const file of list){if(!["image/jpeg","image/png"].includes(file.type)){setErr("Foto harus JPG atau PNG.");continue}if(file.size>MAX_ORIGINAL_SIZE){setErr("Ukuran foto asli maksimal 20 MB per file.");continue}if(files.length+accepted.length>=MAX_PHOTOS){setErr("Maksimal 5 foto.");break}const compressed=await compressImage(file),preview=URL.createObjectURL(compressed);previewUrls.current.add(preview);accepted.push({file:compressed,preview});}setFiles(current=>[...current,...accepted].slice(0,MAX_PHOTOS));}catch(e){setErr(e.message||"Foto gagal diproses. Coba file JPG/PNG lain.")}finally{compressingRef.current=false;setCompressing(false)}}
 function removeFile(i){const removed=files[i];URL.revokeObjectURL(removed.preview);previewUrls.current.delete(removed.preview);setFiles(current=>current.filter((_,j)=>j!==i))}
 async function submit(e){e.preventDefault();setErr("");if(!rating){setErr("Pilih rating terlebih dahulu.");return}if(!text.trim()){setErr("Kritik dan saran wajib diisi.");return}setBusy(true);try{const fd=new FormData();fd.set("rating",String(rating));fd.set("kritik_saran",text.trim());files.forEach(({file})=>fd.append("foto",file));const r=await fetch(`${API}/public/ulasan/${token}`,{method:"POST",body:fd});const b=await r.json();if(!r.ok)throw Error(b.error||"Gagal mengirim ulasan");router.push("/ulasan?terkirim=1")}catch(e){setErr(e.message)}finally{setBusy(false)}}
 const fmt=d=>d?new Date(d).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"}):"—";
 return <div className="min-h-screen bg-white text-[#141a2b]" style={{fontFamily:"var(--font-body)"}}><header className="border-b border-[#e8ebf1]"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4"><UlasanBrand/><Link href="/ulasan" className="border-b-2 border-[#2447a8] pb-1 text-[#14285e]">Ulasan</Link></div></header>
 <main className="mx-auto max-w-5xl px-5 py-10">{!info&&!err?<p className="py-12 text-center text-[#6a7183]">Memeriksa link ulasan…</p>:null}{err&&!info?<div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800"><h1 className="font-display text-3xl">Link ulasan tidak tersedia</h1><p className="mt-2">{err}</p><Link className="mt-4 inline-block underline" href="/ulasan">Lihat galeri ulasan</Link></div>:null}{info&&<div className="space-y-10"><section className="mx-auto max-w-3xl"><div className="mb-6"><h1 className="font-display text-5xl font-semibold text-[#14285e]">Halo, {info.nama_penyewa}</h1><p className="mt-3 text-sm leading-6 text-[#6a7183]">Terima kasih sudah menyewa di JasKita. Ulasan ini terhubung ke sewamu, jadi tidak perlu isi nama lagi.</p></div><form onSubmit={submit} className="rounded-2xl border border-[#e8ebf1] p-5 sm:p-7"><div className="flex items-center gap-3 rounded-xl bg-[#eef3fc] p-4 text-[#14285e]"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white">♧</div><div><span className="mt-1 block text-sm text-[#6a7183]">{fmt(info.tanggal_sewa)} – {fmt(info.tanggal_kembali)}</span></div></div>
 <div className="mb-2 mt-7 flex justify-between font-semibold">Rating <small className="font-normal text-[#6a7183]">wajib</small></div><div className="flex gap-1">{[1,2,3,4,5].map(n=><button key={n} type="button" onClick={()=>setRating(n)} aria-label={`${n} bintang`} className={`text-4xl leading-tight ${n<=rating?"text-[#2447a8]":"text-white [text-shadow:0_0_1px_#2447a8,0_0_1px_#2447a8]"}`}>★</button>)}</div><p className="min-h-6 text-sm text-[#2447a8]">{LABEL[rating]}</p>
 <div className="mb-2 mt-5 flex justify-between font-semibold">Kritik dan saran <small className="font-normal text-[#6a7183]">wajib</small></div><textarea value={text} onChange={e=>setText(e.target.value)} maxLength={5000} required placeholder="Apa yang sudah bagus? Apa yang bisa kami perbaiki?" className="min-h-36 w-full resize-y rounded-xl border border-[#e8ebf1] p-4 outline-none focus:border-[#2447a8]"/><p className="mt-1 text-right text-xs text-[#6a7183]">{text.length}/5000</p>
 <div className="mb-3 mt-6 flex justify-between font-semibold">Foto momen <small className="font-normal text-[#6a7183]">opsional</small></div><div className="grid grid-cols-3 gap-3">{files.map(({file,preview},i)=><div key={preview} className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#eef3fc]"><img src={preview} alt={`Pratinjau foto ${i+1}`} className="h-full w-full object-cover"/><span className="absolute bottom-2 left-2 rounded bg-white/90 px-1.5 py-0.5 text-xs">{formatSize(file.size)}</span><button type="button" disabled={compressing} onClick={()=>removeFile(i)} className="absolute right-2 top-2 rounded-full bg-white px-2 py-1 disabled:opacity-50" aria-label="Hapus foto">×</button></div>)}{files.length<MAX_PHOTOS&&<label className={`flex aspect-[4/5] flex-col items-center justify-center rounded-xl border border-dashed border-[#2447a8] bg-[#eef3fc] text-sm font-semibold text-[#2447a8] ${compressing?"cursor-wait opacity-60":"cursor-pointer"}`}><span className="text-3xl">+</span>{compressing?"Memproses foto…":"Tambah foto"}<input type="file" accept="image/jpeg,image/png" multiple disabled={compressing} className="hidden" onChange={e=>{addFiles(Array.from(e.target.files||[]));e.target.value=""}}/></label>}</div><p className="mt-2 text-sm text-[#6a7183]">JPG atau PNG, maksimal 5 foto. Foto otomatis diperkecil hingga maksimal 300 KB (maks. 1280 px); file asli maksimal 20 MB.</p>
 <div className="my-6 rounded-xl border border-[#e8ebf1] bg-[#fafbfe] p-3 text-sm text-[#6a7183]">Ulasan dan fotomu akan tampil di halaman ulasan JasKita yang bisa dilihat siapa saja.</div>{err&&<p role="alert" className="mb-3 text-sm text-red-700">{err}</p>}<button disabled={busy||compressing} className="w-full rounded-xl bg-[#2447a8] p-4 font-semibold text-white hover:bg-[#14285e] disabled:opacity-60">{compressing?"Memproses foto…":busy?"Mengirim…":info.review?"Perbarui ulasan":"Kirim ulasan"}</button></form></section>
 
 </div>}</main></div>
}
