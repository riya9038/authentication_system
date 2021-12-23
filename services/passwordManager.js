const crypto= require('crypto');
const {promisify} = require('util');

//for encrypting the passwords in the database
const asyncScrypt= promisify(crypto.scrypt);
exports.toHash=async (password)=>{
        const salt=crypto.randomBytes(8).toString('hex');
        const buf=(await asyncScrypt(password,salt,64));
        return `${buf.toString('hex')}.${salt}`;

    }

//decryptes the password and checks with the entered password during login
exports.compare=async (storedPassword,suppliedPassword)=>{
    const [hashedPassword,salt]=storedPassword.split('.');
    const buf=(await asyncScrypt(suppliedPassword,salt,64));

    return buf.toString('hex')==hashedPassword;
}
