
//using promises


const asyncHandler=(reqHandler)=>{
   return (req,res,next)=>{
        Promise.resolve(reqHandler(req,res,next)).catch((err)=>next(err))
    }
}

export {asyncHandler}



/* 
higher ordser function which takes function as parameter or can rueturn function 


using async await

const asyncHandler=(func)=>(req,res,next)=>{
    try{
    await func(req,res,next)
    }
    catch(err){
    res.status(err.code||500).json({
    success:false,
    message:err.message
    })
    }
    
    }

    */