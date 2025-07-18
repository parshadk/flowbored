"use client";

export function AuthPage({isSignin}:{
    isSignin:boolean
}) {
    return (
    <div className="w-screen h-screen flex justify-center items-center">
        <div className="p-4 m-4 bg-white rounded">
            <input type="text" placeholder="Email" className="block w-full mb-2 p-2 border rounded text-black" />
            <input type="password" placeholder="Password" className="block w-full mb-2 p-2 border rounded text-black" />
            <button onClick={()=>{

            }} className="w-full p-2 bg-blue-500 text-white rounded">
                {isSignin ? 'Sign In' : 'Sign Up'}</button>
        </div>
    </div>)
}