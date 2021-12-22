const crypto= require('crypto');
const {promisify} = require('util');

const asyncScrypt= promisify(crypto.scrypt);
exports.toHash=async (password)=>{
        const salt=crypto.randomBytes(8).toString('hex');
        const buf=(await asyncScrypt(password,salt,64));
        return `${buf.toString('hex')}.${salt}`;

    }

exports.compare=async (storedPassword,suppliedPassword)=>{
    const [hashedPassword,salt]=storedPassword.split('.');
    const buf=(await asyncScrypt(suppliedPassword,salt,64));

    return buf.toString('hex')==hashedPassword;
}
