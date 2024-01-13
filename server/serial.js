//for collecting data from the a rduino post
const { SerialPort } = require('serialport')
//const {ReadlineParser} = require('@serialport/parser-readline');
const parsers = SerialPort.parsers;

const port = new SerialPort({
    path:'COM4',
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
})


function sendReminder(reminder) {
    //
    console.log("sending over reminder via serial")
    port.write(reminder)
}


//so when does this happen though????
function receive() {
    const reminder_status = port.read()
    if (reminder_status == "200"){ // or some key
        console.log("task successfully completed")
    }else {
        console.log("they didn't do the task :(")
    }
}

module.exports.port = port;