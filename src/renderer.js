// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var appRootDir = require('app-root-dir').get();
var grinnode = appRootDir +"/src/";
const { exec } = require('child_process')
const {ipcRenderer} = require('electron')
const remote = require('electron').remote;
const app = remote.app;
var os = require("os");
var osvar = os.platform();
var chainType = " --floonet"; //remove this for mainnet

var grinBinaries = "grin-mac";

if (osvar == 'darwin') {
  grinBinaries = "grin-mac";
}else if(osvar == 'win32'){
  grinBinaries = "grin-win";
}

if (chainType != " --floonet"){
    chainType = "";
}

appRootDir = app.getPath('userData');



var fs = require('fs');
var process = '';
var nodeAddress = 'http://45.76.144.45:3413';

var walletArray = [];
var transactionArray = [];
var str = "";


function checkIfWalletAlreadyExists() {
  var fileLocation = appRootDir;
  console.log(appRootDir);
  fileLocation = fileLocation.replace("Library/Application Support/SuperGrin",""); //replace this with wallet if installed
  console.log(fileLocation);


  fs.stat(fileLocation +'.grin/floo/wallet_data/wallet.seed', function(err, stat) {
    if(err == null) {
        console.log('File exists');
        walletExist();
    } else if(err.code === 'ENOENT') {
        // file does not exist
        walletNotExist();
    } else {
        console.log('Some other error: ', err.code);
    }
  });
}

function createWallet(mode,text) {

    if(!mode){

    
    process = exec(grinnode + grinBinaries + chainType + ' wallet -r '+ nodeAddress +' init')
  
    process.stdout.on('data', (data) => {
        var output = data.toString();
        console.log('stdout7: ' + data.toString())
        if (output.includes("Please enter a password for your new wallet")){
            enterPassword();
            showPasswordForm();
            }
        if(output.includes("Invalid Arguments: Not creating wallet - Wallet seed file exists")){
                walletExist();  
        }
        if(output.includes("Please back-up these words in a non-digital format.")){
                var wordSeed = data.toString();
                
                wordSeed = wordSeed.replace("Your recovery phrase is:","");
                wordSeed = wordSeed.replace("Please back-up these words in a non-digital format.","");
                
                wordSeed = wordSeed.replace(/(\r\n|\n|\r)/gm, "");
                wordSeed = wordSeed.replace("wallet.seed","wallet.seed ========================   ");
                backupWallet(wordSeed)
            }
        })
    
        process.stderr.on('data', (data) => {
        console.log('stderr: ' + data.toString())
        })
    }  else if (mode == "password"){
        process.stdin.write(text + "\n");
        process.stdin.write(text + "\n");
        hidePasswordForm();
        walletExist();
    }    
    //process.stdin.write("test\n");
    
    //process.stdin.write("test\n");

    process.on('exit', (code) => {
      console.log('child process exited with code ' + code.toString())
    })
  
};


function deleteWallet() {
    console.log(appRootDir);
    var fileLocation = appRootDir;
    console.log(appRootDir);
    fileLocation = fileLocation.replace("Library/Application Support/SuperGrin",""); //replace this with wallet if installed
    console.log(fileLocation);
    const process = exec('rm -rf '+ fileLocation +'.grin/floo/wallet_data/wallet.seed')
  
    process.stdout.on('data', (data) => {
    var output = data.toString();
      console.log('stdout6: ' + data.toString())
      
    })
  
    process.stderr.on('data', (data) => {
      console.log('stderr: ' + data.toString())
    })

    process.on('exit', (code) => {
      console.log('child process exited with code ' + code.toString())
    })
  
};

var createWalletBtn = document.getElementById('createWalletBtn');
  if(createWalletBtn){
    createWalletBtn.addEventListener('click', function() {
        ipcRenderer.send('createWallet', 'ping');
        hideCreateDeleteBtn();
        createWallet();
        showPasswordForm();
      });
      
}

var deleteWalletBtn = document.getElementById('deleteWalletBtn');
  if(deleteWalletBtn){
    deleteWalletBtn.addEventListener('click', function() {
        ipcRenderer.send('deleteWallet', 'ping');
        deleteWallet();
      });
      
}

var startNodeBtn = document.getElementById('startNodeBtn');
  if(startNodeBtn){
    startNodeBtn.addEventListener('click', function() {
        startNode();
      });
      
}

var checkBalanceBtn = document.getElementById('checkBalanceBtn');
  if(checkBalanceBtn){
    checkBalanceBtn.addEventListener('click', function() {
        checkWalletBalance();
        walletExist();
        hideWordSeed();
      });
      
}

var sendGrinBtn = document.getElementById('sendGrinBtn');
  if(sendGrinBtn){
    sendGrinBtn.addEventListener('click', function() {
        
        sendGrin();
    });
      
}

var checkInitialBtn = document.getElementById('checkInitialBtn');
  if(checkInitialBtn){
    checkInitialBtn.addEventListener('click', function() { 
        checkIfWalletAlreadyExists();
    });
      
}

/*
var inputPassword = document.getElementById('inputPassword');
var inputPasswordConfirm = document.getElementById('inputPasswordConfirm');
if(inputPasswordConfirm){
    
    inputPasswordConfirm.addEventListener('keypress', function (e) {
       
        ipcRenderer.send('inputPasswordConfirm', 'ping');
        var key = e.which || e.keyCode;
        if (key === 13) { // 13 is enter
          // code for enter
          if (inputPassword.value == inputPasswordConfirm.value){
            document.getElementById("warningPassword").innerHTML = "";   
            console.log(inputPasswordConfirm.value);
            console.log("test enter password");
  
            createWallet("password", inputPasswordConfirm.value);
          }
          else {
            var passwordWarning = "<div id=\"warningText\" class=\"alert alert-secondary\" role=\"alert\"> Password Warning</div>";
            document.getElementById("warningPassword").innerHTML = passwordWarning;  
          }
          
        }
    });
      
}

*/
var createWalletProcessBtn = document.getElementById('createWalletProcessBtn');
if(createWalletProcessBtn){
  createWalletProcessBtn.addEventListener('click', function() {
    if (inputPassword.value == inputPasswordConfirm.value){
      document.getElementById("warningPassword").innerHTML = "";   
      console.log(inputPasswordConfirm.value);
      console.log("test enter password");
      alert("Please write down your word seed. Otherwise you will lose your coins.")
      createWallet("password", inputPasswordConfirm.value);
    }
    else {
      var passwordWarning = "<div id=\"warningText\" class=\"alert alert-secondary\" role=\"alert\"> Password Warning</div>";
      document.getElementById("warningPassword").innerHTML = passwordWarning;  
    }
  });
    
}

var wordSeedBtn = document.getElementById('buttonWordSeed');
if(wordSeedBtn){
    wordSeedBtn.addEventListener('click', function() {
        ipcRenderer.send('hidewordseed', 'ping');
        hideWordSeed();
      });
      
}

var receiveFile = document.getElementById('dragFileReceive');

receiveFile.ondragover = () => {
  return false;
};

receiveFile.ondragleave = () => {
  return false;
};

receiveFile.ondragend = () => {
  return false;
};

receiveFile.ondrop = (e) => {
  e.preventDefault();

  for (let f of e.dataTransfer.files) {
    console.log('File(s) you dragged here: ', f.path)
    finalizeReceive(f.path);
  }
            
  return false;
};


var finalizeFile = document.getElementById('dragFileResponse');

finalizeFile.ondragover = () => {
  return false;
};

finalizeFile.ondragleave = () => {
  return false;
};

finalizeFile.ondragend = () => {
  return false;
};

finalizeFile.ondrop = (e) => {
  e.preventDefault();

  for (let f of e.dataTransfer.files) {
    console.log('File(s) you dragged here: ', f.path)
    finalizeResponse(f.path);
    
  }
            
  return false;
};


var navSend = document.getElementById('nav-send-tab');
  if(navSend){
    navSend.addEventListener('click', function() {
      console.log("clicked");
        hideAllWarning();
        showSend();
      });
      
}

var navReceive = document.getElementById('nav-receive-tab');
  if(navReceive){
    navReceive.addEventListener('click', function() {
      console.log("clicked");
        showReceive();
      });
      
}
var cancelBtn = document.getElementById('cancelGrinBtn');
  if(cancelBtn){
    cancelBtn.addEventListener('click', function() {
      console.log("cancel");
        cancelTransactionGrin();
      });
      
}


module.exports.createWallet = createWallet;

function cancelTransactionGrin(){
  resetAPISecret();
  
  transactionArray = [];

  process = exec(grinnode + grinBinaries + chainType +' wallet -r '+ nodeAddress +' txs');

  enterPasswordToProcess();

  process.stdout.on('data', (data) => {
    str = data.toString();


    var strArray = str.split("\n");
    transactionArray.push(strArray);
    console.log("transaction array " + transactionArray.length);



    var output = data.toString();
    console.log('stdout7: ' + data.toString())
    
    
    if (transactionArray.length == 5){
      console.log("Transaction 3 Array " + transactionArray[3].length);
      cancelGrinNew(transactionArray[3].length);
    }

  })
  

  
  process.stderr.on('data', (data) => {
      console.log('stderr: ' + data.toString())
  })

  process.on('exit', (code) => {
      console.log('child process exited with code ' + code.toString())
  })
}


function cancelGrinNew(x){
  var i = 0, howManyTimes = x;
  function wait() {
    console.log('canceling transaction no: ' + i);
    resetAPISecret();
    process = exec(grinnode + grinBinaries + chainType +' wallet -r '+ nodeAddress +' cancel -i '+ i);
    enterPasswordToProcess();

    process.stdout.on('data', (data) => {
      var output = data.toString();
      console.log('stdout8: ' + data.toString())
      if(output.includes("Command 'cancel' completed successfully")){
        
        console.log('stdout9: SUCCESS ')
       
      }
    })
    
  
    
    process.stderr.on('data', (data) => {
        console.log('stderr8: ' + data.toString())
    })
  
    process.on('exit', (code) => {
        console.log('child process exited with code ' + code.toString())
        
    })
      i++;
      if( i < howManyTimes ){
          setTimeout( wait, 1000 );
      }
  }
  wait();
}
function cancelGrin(i){
  
  console.log("Cancel Transaction = " + i );

  var x = 6;
  //for (x = 1; x < i; x++) { 
    console.log('canceling transaction no: ' + x);
    resetAPISecret();
    process = exec(grinnode + grinBinaries + chainType +' wallet -r '+ nodeAddress +' cancel -i '+ x);
    enterPasswordToProcess();

    process.stdout.on('data', (data) => {
      var output = data.toString();
      console.log('stdout8: ' + data.toString())
      if(output.includes("Command 'cancel' completed successfully")){
        
        console.log('stdout9: SUCCESS ')
       
      }
    })
    
  
    
    process.stderr.on('data', (data) => {
        console.log('stderr8: ' + data.toString())
    })
  
    process.on('exit', (code) => {
        console.log('child process exited with code ' + code.toString())
        
    })


  //}
  
  
}


function sendGrin() {
  resetAPISecret();
  var sendGrinAmount = document.getElementById('sendGrinAmount').value;
  console.log(sendGrinAmount);

  
  
  let textRandom = Math.random().toString(36).substring(7);
  var fileLocation = appRootDir;
  console.log(appRootDir);
  fileLocation = fileLocation.replace("Library/Application Support/SuperGrin","Desktop"); //replace this with wallet if installed
  console.log(fileLocation);
  
  
  process = exec(grinnode + grinBinaries + chainType +' wallet -r '+ nodeAddress +' send -m file -d '+ fileLocation +'mytransaction-'+ textRandom+'.tx '+ sendGrinAmount);
  
  process.stdout.on('data', (data) => {
    var output = data.toString();
      console.log('stdout5: ' + data.toString())
      if (output == "Password: "){
        console.log("ask password");
        enterPasswordToProcess();
      }
      if (output.includes("Not enough funds")){
        document.getElementById("sendGrinWarning").style = "display: block;";
        document.getElementById("sendGrinWarning").innerHTML = output;
        console.log(output);
      }
      if (output.includes("Command \'send\' completed successfully")){
        document.getElementById("sendGrinWarning").style = "display: block;";
        document.getElementById("sendGrinWarning").innerHTML = output;
        console.log(output);
      }
  })

  
  process.stderr.on('data', (data) => {
      console.log('stderr: ' + data.toString())
  })

  process.on('exit', (code) => {
      console.log('child process exited with code ' + code.toString())
  })
  //grin wallet send -m file -d my_grin_transaction.tx 10.25
}


function finalizeReceive(fileLocation) {
  resetAPISecret();
  process = exec(grinnode + grinBinaries + chainType +' wallet -r '+ nodeAddress +' receive -i ' + fileLocation)
  enterPasswordToProcess();
  process.stdout.on('data', (data) => {
  var output = data.toString();
    console.log('stdout4: ' + data.toString())
    if (output.includes("Wallet command failed")){
      document.getElementById("sendGrinWarning").style = "display: block;";
      document.getElementById("sendGrinWarning").innerHTML = output;
      console.log(output);
    }
  })

  process.stderr.on('data', (data) => {
    console.log('stderr: ' + data.toString())
  })

  process.on('exit', (code) => {
    console.log('child process exited with code ' + code.toString())
  })

};

function finalizeResponse(fileLocation) {
  resetAPISecret();
  process = exec(grinnode + grinBinaries + chainType +' wallet -r '+ nodeAddress +' finalize -i ' + fileLocation)
  enterPasswordToProcess();
  process.stdout.on('data', (data) => {
  var output = data.toString();
    console.log('stdout3: ' + data.toString())
    
  })

  process.stderr.on('data', (data) => {
    console.log('stderr: ' + data.toString())
  })

  process.on('exit', (code) => {
    console.log('child process exited with code ' + code.toString())
  })

};

function enterPassword() {
    console.log("enter password");
}

function walletNotExist() {
  document.getElementById("checkBalanceBtn").style = "display: none;";
  document.getElementById("SendAndReceiveBox").style = "display: none;";
  document.getElementById("createWalletBtn").style = "display: block;";
  document.getElementById("deleteWalletBtn").style = "display: block;";
  document.getElementById("checkBtnDiv").style = "display: none;";
  document.getElementById("balanceBox").style = "display: none;";
  document.getElementById("wordSeedBox").style = "display: none;";
  hidePasswordForm();
}

function walletExist() {
  document.getElementById("createWalletBtn").style = "display: none;";
  document.getElementById("deleteWalletBtn").style = "display: none;";
  document.getElementById("checkBalanceBtn").style = "display: block;";
  document.getElementById("SendAndReceiveBox").style = "display: block;";
  document.getElementById("checkBtnDiv").style = "display: block;";
  document.getElementById("balanceBox").style = "display: block;";
  
  checkWalletBalance();
  startNode();
  

}

function backupWallet(wordText) {
    console.log(wordText);
    console.log("Please Backup Wallet");
    document.getElementById("wordSeedBox").style = "display: block;";
    document.getElementById("wordSeedBoxNew").innerHTML = wordText;
 
    document.getElementById("buttonWordSeed").style = "display: inline;";

}



function hideWordSeed() {
    
    console.log("hide wallet");
    document.getElementById("wordSeedBox").style = "display: none";
    document.getElementById("wordSeedBox").innerHTML = "";
    /*
    document.getElementById("createWalletBtn").style = "display: none;";
    document.getElementById("inputPasswordText").style = "display: none;";
    document.getElementById("inputPasswordConfirmText").style = "display: none;";
    document.getElementById("inputPassword").style = "display: none;";
    document.getElementById("inputPasswordConfirm").style = "display: none;";

    */
    document.getElementById("buttonWordSeed").style = "display: none;";
    

}

function resetAPISecret(){
  console.log(appRootDir);
  var fileLocation = appRootDir;
  console.log(appRootDir);
  fileLocation = fileLocation.replace("Library/Application Support/SuperGrin",""); //replace this with wallet if installed
  console.log(fileLocation);
  
 
  fs.unlink(fileLocation +'.grin/floo/.api_secret',function(err){
    if(err) return console.log(err);
    //console.log('file deleted successfully');
  }); 
  
  fs.writeFile(fileLocation +'.grin/floo/.api_secret', 'UCSxkU9L4kYHuZKFVBYb', function (err) {
    if (err) {
        return console.log(err);
    }
    console.log("The file was saved!");
});
  

}
function startNode() {
    resetAPISecret();
    process = exec(grinnode + grinBinaries + chainType +' wallet -r '+ nodeAddress +' info')
  
    process.stdout.on('data', (data) => {
    var output = data.toString();
      console.log('stdout2: ' + data.toString())
      enterPasswordToProcess();
    })
  
    process.stderr.on('data', (data) => {
      console.log('stderr: ' + data.toString())
    })

    process.on('exit', (code) => {
      console.log('child process exited with code ' + code.toString())
    })
  
};
  
function showPasswordForm(){
  document.getElementById('formPasswordDiv').style.display = 'block';
}
function hidePasswordForm(){
  document.getElementById('formPasswordDiv').style.display = 'none';
}

function enterPasswordToProcess(){
  process.stdin.write("test\n");
}

function hideCreateDeleteBtn(){
  document.getElementById("createWalletBtn").style = "display: none;";
  document.getElementById("deleteWalletBtn").style = "display: none;";
}

function hideAllWarning(){
  document.getElementById("formWalletInit").style = "display: none;";
  document.getElementById("sendGrinWarning").style = "display: none;";
}
function checkWalletBalance() {
    
    hidePasswordForm();
    hideAllWarning();
    console.log("check balance");
    console.log(walletArray.length);
    resetAPISecret();
    process = exec(grinnode + grinBinaries + chainType +' wallet -r '+ nodeAddress +' info');
    

    enterPasswordToProcess();
   
   
    process.stdout.on('data', (data) => {
    var output = data.toString();
      console.log('stdout1: ' + data.toString())
       
        str = data.toString();
        var strArray = str.split("\n");
        walletArray.push(strArray);
        console.log(strArray);
       // console.log(walletArray.length);
       
        if (walletArray.length == 4){
        
            var totalBalance = walletArray[2][0];
            totalBalance = totalBalance.replace("Total                            | ","");
            totalBalance = totalBalance.replace(" ","");

            var awaitingConfirmation = walletArray[2][1];
            awaitingConfirmation = awaitingConfirmation.replace(" Awaiting Confirmation (< 10)     | ","");

            var lockedPreviousTransaction = walletArray[2][2];
            lockedPreviousTransaction = lockedPreviousTransaction.replace(" Locked by previous transaction   | ","");

            var currentlySpendable = walletArray[2][4];
            currentlySpendable = currentlySpendable.replace(" Currently Spendable              | ","");

            console.log(totalBalance);
            console.log(awaitingConfirmation);
            console.log(lockedPreviousTransaction);
            console.log(currentlySpendable);
            /*
            db.createTable('walletInfo', (succ, msg) => {
              // succ - boolean, tells if the call is successful
              console.log("Success: " + succ);
              console.log("Message: " + msg);
            })
            */
            let objectWallet = new Object();
            
            if(totalBalance == awaitingConfirmation){
              document.getElementById("balanceWarningBox").style = "display: block;";
            }
            else{
              document.getElementById("balanceWarningBox").style = "display: none;";
            }
            
            if(totalBalance == "0.000000000 "){
              if(awaitingConfirmation == "0.000000000 "){
                document.getElementById("balanceWarningBox").style = "display: none;";
              }
            }

            objectWallet.totalBalance = totalBalance;
            objectWallet.awaitingConfirmation = awaitingConfirmation;
            objectWallet.lockedPreviousTransaction = lockedPreviousTransaction;
            objectWallet.currentlySpendable = currentlySpendable;
            /*
            db.insertTableContent('walletInfo', objectWallet, (succ, msg) => {
              // succ - boolean, tells if the call is successful
              console.log("Success: " + succ);
              console.log("Message: " + msg);
            })
            */
            document.getElementById("totalBalance").innerHTML = totalBalance;
            walletArray = [];
        }

        if (walletArray.length > 4){
            walletArray = [];
        }
    })
  
    process.stderr.on('data', (data) => {
      console.log('stderr: ' + data.toString())
    })

    process.on('exit', (code) => {
      console.log('child process exited with code ' + code.toString())
    })
  
};
  

