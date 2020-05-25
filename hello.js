var Immuto = require('immuto-sdk')
var readline = require('readline');

var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
});

run_test()


function get_credentials() {
        return new Promise((resolve, reject) => {
                credentials = {}
                if (process.env.EMAIL && process.env.PASSWORD) {
                        credentials.email = process.env.EMAIL
                        credentials.password = process.env.PASSWORD
                        resolve(credentials)
                        return
                }

                rl.question('Immuto dev email: ', function(email) {
                        credentials.email = email
                        rl.stdoutMuted = true;
                        rl.question('Immuto dev password: ', function(password) {
                                credentials.password = password
                                rl.close();
                                resolve(credentials)
                        });
                        rl._writeToOutput = function _writeToOutput(stringToWrite) {
                                if (rl.stdoutMuted)
                                        if ("\r\n".includes(stringToWrite))
                                                rl.output.write(stringToWrite)
                                        else 
                                                rl.output.write('*');
                                else
                                        rl.output.write(stringToWrite);
                        };
                });
        })
}

async function run_test() {
        try {
                let cred = await get_credentials()
                let im = Immuto.init(true, "https://dev.immuto.io")
                        
                console.log("Authenticating")
                await im.authenticate(cred.email, cred.password)

                console.log("Running test")
                let recordID = await im.create_data_management('Hello World', 'Test record', 'basic', cred.password, "")
                console.log("Hello World record successfully created:", recordID) 

                let verification = await im.verify_data_management(recordID, 'basic', 'Hello World')
                if (verification === false) {
                        console.error("Hello World record verification failed :(")
                } else {
                        console.log("Hello World record verification successful!")
                        console.log(verification)
                }      
        } catch (err) {
                console.error("Error during test:")
                console.error(err)
        } finally {
		process.exit()
	}
}
