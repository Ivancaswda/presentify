import React, {useState} from 'react'
import {Button} from "@/components/ui/button";
import {ArrowRight, Loader2Icon, Sparkle, Sparkles, XIcon} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Separator} from "@/components/ui/separator";


const FloatingActionTool = ({position, onClose, handleAiChange, loading}:any) => {

    const [userAiPrompt, setUserAiPrompt] = useState()

    if (!position)return
    return (
        <div style={{
            top:position.y+10,
            left:position.x,
            transform: "translate(-80%)"
        }} className='absolute z-50 bg-white text-black text-sm px-3 py-2 rounded-lg shadow-xl border flex items-center'>
            <div className='flex gap-2 items-center'>
                <Sparkles className='h-4 w-4'/>
                <Input value={userAiPrompt} disabled={loading} onChange={(event) => setUserAiPrompt(event.target.value)} type='text' placeholder='редактируйте с ии' />
                {userAiPrompt && <Button onClick={() => {
                    handleAiChange(userAiPrompt);
                    setUserAiPrompt('')
                }} variant='ghost'>
                    <ArrowRight/>
                </Button>}
                {loading && <Loader2Icon className='animate-spin'/>}


            </div>
            <Separator orientation='vertical'/>
            <Button onClick={onClose} variant='ghost' >
                <XIcon  />
            </Button>

        </div>
    )
}
export default FloatingActionTool
