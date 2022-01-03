const queue= require('../config/kue');
const resetPasswordMailer= require('../mailers/resetMail');

queue.process('emails', function(job, done){

    console.log('worker is processing the job',job.data);
    resetPasswordMailer.newPassword(job.data);
    done();
})