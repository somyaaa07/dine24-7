import bcrypt from 'bcryptjs'


export const hashPassword = async(password)=>{
    return await bcrypt.hash(password, 10)
}

export const comparePassword = async(plain,hashed)=>{
    return await bcrypt.compare(plain,hashed)
}

export const hashToken = async(token)=>{
    return await bcrypt.hash(token,10)
}

export const compareToken = async(token,hashed)=>{
    return await bcrypt.compare(token,hashed)
}