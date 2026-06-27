"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Images,
} from "lucide-react";


type ImageType = {
  url: string;
  publicId: string;
};



const slideVariants = {

  enter: (direction:number)=>({
    x: direction > 0 ? "100%" : "-100%",
    opacity:0,
    scale:1.05,
  }),


  center:{
    x:0,
    opacity:1,
    scale:1,
  },


  exit:(direction:number)=>({
    x: direction < 0 ? "100%" : "-100%",
    opacity:0,
    scale:1.05,
  })

};



export default function ListingSlider({
  images
}:{
  images:ImageType[]
}){


const [[page,direction],setPage] = useState([0,0]);

const intervalRef = useRef<NodeJS.Timeout|null>(null);



const current =
(page + images.length) % images.length;



const navigate = (dir:number)=>{

setPage([
page + dir,
dir
]);

};



const stopAutoPlay=()=>{

if(intervalRef.current){

clearInterval(intervalRef.current);

intervalRef.current=null;

}

};



const startAutoPlay=()=>{


stopAutoPlay();


if(images.length <=1) return;



intervalRef.current=setInterval(()=>{

navigate(1);

},5000);


};



useEffect(()=>{

startAutoPlay();


return()=>stopAutoPlay();


},[images.length]);





if(!images || images.length===0){

return (

<div className="
h-64
w-full
flex
items-center
justify-center
rounded-xl
bg-gray-100
text-gray-500
">

No Media

</div>

)

}




const file = images[current];

const isVideo =
/\.(mp4|webm|ogg)$/i.test(file.url);




const handleDragEnd = (
_:any,
info:{
offset:{x:number},
velocity:{x:number}
}

)=>{


const swipe = info.offset.x;

const speed = info.velocity.x;



if(swipe < -40 || speed < -300){

navigate(1);

}



else if(swipe > 40 || speed > 300){

navigate(-1);

}


};




return (



<div


onMouseEnter={stopAutoPlay}

onMouseLeave={startAutoPlay}

onTouchStart={stopAutoPlay}

onTouchEnd={startAutoPlay}



className="
group
relative
h-64
sm:h-72
w-full
overflow-hidden
rounded-xl
bg-black
shadow-xl
"

>



<AnimatePresence
initial={false}
custom={direction}
mode="wait"
>


<motion.div


key={page}


custom={direction}


variants={slideVariants}


initial="enter"

animate="center"

exit="exit"



drag="x"


dragDirectionLock


dragConstraints={{
left:0,
right:0
}}



dragElastic={0.25}



onPointerDown={(e)=>{

e.stopPropagation();
stopAutoPlay();

}}



onDragEnd={handleDragEnd}



style={{

touchAction: "pan-y"

}}



transition={{

x:{
type:"spring",
stiffness:350,
damping:35
},

opacity:{
duration:0.2
},

scale:{
duration:0.6
}

}}



className="
absolute
inset-0
h-full
w-full
cursor-grab
active:cursor-grabbing
"



>



{isVideo ? (


<video

src={file.url}

controls

className="
h-full
w-full
object-cover
"

/>


):(


<img


src={file.url}


alt="listing"


draggable={false}


className="
h-full
w-full
object-cover
select-none
"


/>


)}

</motion.div>

</AnimatePresence>



{/* counter */}

<div
className="
absolute
right-4
top-4
z-30
flex
items-center
gap-2
rounded-full
bg-black/40
px-3
py-1.5
text-xs
text-white
backdrop-blur-lg
"
>

<Images size={14}/>

{current+1}/{images.length}


</div>



{/* arrows */}
{images.length>1 && (
<>
<button

onClick={(e)=>{
e.preventDefault();
e.stopPropagation();
navigate(-1);

}}

className="
hidden
sm:flex
absolute
left-4
top-1/2
z-30
h-11
w-11
-translate-y-1/2
items-center
justify-center
rounded-full
bg-white/20
text-white
backdrop-blur-lg
opacity-0
transition
group-hover:opacity-100
"
>
<ChevronLeft/>


</button>

<button
onClick={(e)=>{
e.preventDefault();
e.stopPropagation();
navigate(1);

}}
className="
hidden
sm:flex
absolute
right-4
top-1/2
z-30
h-11
w-11
-translate-y-1/2
items-center
justify-center
rounded-full
bg-white/20
text-white
backdrop-blur-lg
opacity-0
transition
group-hover:opacity-100
"


>


<ChevronRight/>


</button>


</>

)}





{/* bottom overlay */}


<div

className="
absolute
bottom-0
left-0
right-0
z-20
bg-gradient-to-t
from-black/70
to-transparent
px-5
pb-5
pt-16
pointer-events-none
"

>


<h3

className="
text-white
font-semibold
text-lg
"

>

Explore Every Detail

</h3>



{isVideo && (

<div

className="
mt-2
inline-flex
items-center
gap-2
rounded-full
bg-white/20
px-3
py-1
text-white
backdrop-blur-lg
"

>


<Play size={14}/>

Video


</div>


)}



</div>





{/* dots */}

{images.length>1 && (

<div
className="absolute
bottom-4
left-1/2
z-30
flex
-translate-x-1/2
gap-2
"
>

{images.map((_,index)=>(


<button

key={index}

onClick={(e)=>{

e.preventDefault();

e.stopPropagation();

navigate(index-current);

}}

className={`
h-2
rounded-full
transition-all

${
index===current

?

"w-7 bg-white"

:

"w-2 bg-white/60"

}

`}

></button>

))}
</div>
)}

</div>
)
}