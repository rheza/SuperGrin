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
var chainType = " --floonet"; //remove this for mainnet if floo use " --floonet"
var nodeAddress = 'http://45.76.144.45:3413'; //floonet

var grinBinaries = "grin-mac";
var pathToData  = "floo/";
var apiSecretValue = "UCSxkU9L4kYHuZKFVBYb";

const Store = require('electron-store');
const store = new Store();

if (osvar == 'darwin') {
  grinBinaries = "grin-mac";
}else if(osvar == 'win32'){
  grinBinaries = "grin-win";
}

if (chainType != " --floonet"){
    chainType = "";
    nodeAddress = 'http://35.197.132.97:3413';
    pathToData = "main/";
    apiSecretValue = "DffhUVu4SBz5Yv2TFF8g";
}

appRootDir = app.getPath('userData');


var fs = require('fs');
var process = '';

var walletArray = [];
var transactionArray = [];
var str = "";


function checkIfWalletAlreadyExists() {
  var fileLocation = appRootDir;
  console.log(appRootDir);
  fileLocation = fileLocation.replace("Library/Application Support/SuperGrin",""); //replace this with wallet if installed
  console.log(fileLocation);


  fs.stat(fileLocation +'.grin/'+ pathToData +'wallet_data/wallet.seed', function(err, stat) {
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
                wordSeed = wordSeed.replace("wallet.seed","wallet.seed ==   ");
                var wordSeedWithLog = wordSeed;
                var wordSeedWithoutLog = wordSeedWithLog.substring(wordSeedWithLog.indexOf("==")+1);
                wordSeedWithoutLog = wordSeedWithoutLog.trim();
                wordSeedWithoutLog = wordSeedWithoutLog.replace("= ","");
                backupWallet(wordSeedWithoutLog);
            }
        })
    
        process.stderr.on('data', (data) => {
        console.log('stderr: ' + data.toString())
        })
    }  else if (mode == "password"){
        store.set('password',text);
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
    const process = exec('rm -rf '+ fileLocation +'.grin/'+ pathToData +'wallet_data/wallet.seed')
  
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
var inputPasswordReceive = document.getElementById('inputPasswordReceive');
var enterPasswordReceiveBtn = document.getElementById('enterPasswordReceiveBtn');

if (store.get('password') != ""){
  inputPasswordReceive.value = store.get('password');
}

if(enterPasswordReceiveBtn){
  enterPasswordReceiveBtn.addEventListener('click', function() {
        if(inputPasswordReceive.value != ""){
          if(inputFileLocationReceive.value != ""){
            store.set('password',inputPasswordReceive.value );
            finalizeReceive(inputFileLocationReceive.value,inputPasswordReceive.value);
          }
        }
    });
}

var inputPasswordSend = document.getElementById('inputPasswordSend');
var sendGrinBtn = document.getElementById('sendGrinBtn');
var enterPasswordSendBtn = document.getElementById('enterPasswordSendBtn');
var sendGrinAmount = document.getElementById('sendGrinAmount');


if(sendGrinBtn){
  sendGrinBtn.addEventListener('click', function() {
    console.log(inputPasswordSend.value);
    console.log(store.get('password'));
        if(store.get('password') != ""){
            store.set('password',inputPasswordSend.value );
            sendGrin(sendGrinAmount.value,inputPasswordSend.value);
            //finalizeSend(inputFileLocationReceive.value,inputPasswordReceive.value);
        }else{
           inputPasswordSend.value = "";
           showPasswordSendForm();
        }
    });
}

if(enterPasswordSendBtn){
  enterPasswordSendBtn.addEventListener('click', function() {
    console.log(inputPasswordSend.value);
    console.log(store.get('password'));
    console.log(sendGrinAmount.value);
    if(inputPasswordSend.value != ""){
        store.set('password',inputPasswordSend.value );
        sendGrin(sendGrinAmount.value,inputPasswordSend.value);
        //finalizeSend(inputFileLocationReceive.value,inputPasswordReceive.value);
    }
  });
}

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



var checkBalanceBtn = document.getElementById('checkBalanceBtn');
  if(checkBalanceBtn){
    checkBalanceBtn.addEventListener('click', function() {
        checkWalletBalance();
        walletExist();
        hideWordSeed();
        console.log(store.get('password'));
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
      store.set('password',inputPasswordConfirm.value );
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

var receiveFile = document.getElementById('dragBoxReceive');
var inputFileLocationReceive = document.getElementById('inputFileLocationReceive');
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
    inputFileLocationReceive.value = f.path;
    showPasswordReceiveForm();
    
  }
            
  return false;
};


var finalizeFile = document.getElementById('dragBoxSend');
var inputFileLocationSend = document.getElementById('inputFileLocationSend');
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
    
  if (store.get('password') != ""){
    inputFileLocationSend.value = f.path;
    finalizeSend(f.path,store.get('password'));
  }else{
    console.log('File(s) you dragged here: ', f.path);
    inputFileLocationSend.value = f.path;
    showPasswordSendForm();
  }
    

    
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

  enterPasswordReceiveSend(store.get('password'));

  process.stdout.on('data', (data) => {
    str = data.toString();

    console.log(str);
    var strArray = str.split("\n");
    transactionArray.push(strArray);
    console.log("transaction array " + transactionArray.length);



    var output = data.toString();
    console.log('stdout7: ' + data.toString())

    
    if (transactionArray.length == 4){
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
    enterPasswordReceiveSend(store.get('password'));

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
          setTimeout( wait, 1500 );
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
    enterPasswordReceiveSend(store.get('password'));

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


function sendGrin(amount, password) {
  resetAPISecret();
  var sendGrinAmount = amount;
  console.log(sendGrinAmount);

  
  
  let textRandom = Math.random().toString(36).substring(7);
  var fileLocation = appRootDir;
  console.log(appRootDir);
  fileLocation = fileLocation.replace("Library/Application Support/SuperGrin","Desktop/"); //replace this with wallet if installed
  console.log(fileLocation);
  
  
  process = exec(grinnode + grinBinaries + chainType +' wallet -r '+ nodeAddress +' send -m file -d '+ fileLocation +'mytransaction-'+ textRandom+'.tx '+ sendGrinAmount);
  
  process.stdout.on('data', (data) => {
    var output = data.toString();
      console.log('stdout5: ' + data.toString())
      if (output == "Password: "){
        console.log("ask password");
        console.log(password);
        if(password){
          store.set('password',password);
          enterPasswordReceiveSend(password);          
        }else{
          showPasswordSendForm();
        }
        
      }
      if (output.includes("Not enough funds")){
        document.getElementById("sendGrinWarning").style = "display: block;";
        document.getElementById("sendGrinWarning").innerHTML = output;
        console.log(output);
        hidePasswordSendForm();
      }
      if (output.includes("Command \'send\' completed successfully")){
        document.getElementById("sendGrinWarning").style = "display: block;";
        document.getElementById("sendGrinWarning").innerHTML = output;
        console.log(output);
        hidePasswordSendForm();
      }
  })

  

  process.stderr.on('data', (data) => {
      console.log('stderr: ' + data.toString())
  })

  process.on('exit', (code) => {
      console.log('child process exited with code ' + code.toString());
      hidePasswordReceiveForm();
  })
  //grin wallet send -m file -d my_grin_transaction.tx 10.25
}


function finalizeReceive(fileLocation,password) {
  resetAPISecret();
  process = exec(grinnode + grinBinaries + chainType +' wallet -r '+ nodeAddress +' receive -i ' + fileLocation);
  console.log(fileLocation);
  console.log(password);
  enterPasswordReceiveSend(password);
  process.stdout.on('data', (data) => {
  var output = data.toString();
    console.log('stdout4: ' + data.toString())
    if (output.includes("Wallet command failed")){
      document.getElementById("sendGrinWarning").style = "display: block;";
      document.getElementById("sendGrinWarning").innerHTML = output;
      hidePasswordReceiveForm();
      console.log(output);
    }
    if (output.includes("Invalid Arguments:")){
      document.getElementById("sendGrinWarning").style = "display: block;";
      document.getElementById("sendGrinWarning").innerHTML = output;
      console.log(output);
    }
    if (output.includes("success")){
      hidePasswordReceiveForm();
    }
  })

  process.stderr.on('data', (data) => {
    console.log('stderr: ' + data.toString())
  })

  process.on('exit', (code) => {
    hidePasswordReceiveForm();
    console.log('child process exited with code ' + code.toString())
  })

};
function finalizeSend(fileLocation,password) {
  resetAPISecret();
  process = exec(grinnode + grinBinaries + chainType +' wallet -r '+ nodeAddress +' finalize -i ' + fileLocation)
  console.log(fileLocation);
  console.log(password);
  enterPasswordReceiveSend(password);
  process.stdout.on('data', (data) => {
  var output = data.toString();
    console.log('stdout3: ' + data.toString())
    if (output.includes("Wallet command failed")){
      document.getElementById("sendGrinWarning").style = "display: block;";
      document.getElementById("sendGrinWarning").innerHTML = output;
      console.log(output);
      console.log("Finalize");
      hidePasswordSendForm();
    }
    if (output.includes("Invalid Arguments:")){
      document.getElementById("sendGrinWarning").style = "display: block;";
      document.getElementById("sendGrinWarning").innerHTML = output;
      console.log(output);
    }
    if (output.includes("success")){
      hidePasswordSendForm();
    }
  })

  process.stderr.on('data', (data) => {
    console.log('stderr: ' + data.toString())
  })

  process.on('exit', (code) => {
    hidePasswordSendForm();
    showSend();
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
  document.getElementById("wordSeedBox").style = "display: none;";
  document.getElementById("createWalletBtn").style = "display: none;";
  document.getElementById("deleteWalletBtn").style = "display: none;";
  document.getElementById("checkBalanceBtn").style = "display: block;";
  document.getElementById("SendAndReceiveBox").style = "display: block;";
  document.getElementById("checkBtnDiv").style = "display: block;";
  document.getElementById("balanceBox").style = "display: block;";
  document.getElementById("enterPasswordReceive").style = "display: none;";
  document.getElementById("enterPasswordSend").style = "display: none;";
  checkWalletBalance();

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
  console.log(apiSecretValue);
  console.log(fileLocation +'.grin/'+ pathToData +'.api_secret');
  fs.unlink(fileLocation +'.grin/'+ pathToData +'.api_secret',function(err){
    if(err) return console.log(err);
    //console.log('file deleted successfully');
  }); 
  
  fs.writeFile(fileLocation +'.grin/'+ pathToData +'.api_secret', apiSecretValue, function (err) {
    if (err) {
        return console.log(err);
    }
    console.log("The file was saved!");
});
  

}
  
function showPasswordSendForm(){
  document.getElementById('sendGrinAmount').style.display = 'none';
  document.getElementById('sendGrinBtn').style.display = 'none';
  document.getElementById('cancelGrinBtn').style.display = 'none';
  document.getElementById('enterPasswordSend').style.display = 'block';
  document.getElementById('dragBoxSend').style.display = 'none';
}

function hidePasswordSendForm(){
  document.getElementById('enterPasswordSend').style.display = 'none';
  document.getElementById('dragBoxSend').style.display = 'block';
  document.getElementById('sendGrinAmount').style.display = 'block';
  document.getElementById('sendGrinBtn').style.display = 'block';
  document.getElementById('cancelGrinBtn').style.display = 'block';
}
  
function showPasswordReceiveForm(){
  document.getElementById('enterPasswordReceive').style.display = 'block';
  document.getElementById('dragBoxReceive').style.display = 'none';
}

function hidePasswordReceiveForm(){
  document.getElementById('enterPasswordReceive').style.display = 'none';
  document.getElementById('dragBoxReceive').style.display = 'block';
}

function showPasswordForm(){
  document.getElementById('formPasswordDiv').style.display = 'block';
}
function hidePasswordForm(){
  document.getElementById('formPasswordDiv').style.display = 'none';
}

function enterPasswordToProcess(){
  process.stdin.write("test\n");
}

function enterPasswordReceiveSend(password){
  var value = password+"\n";
  console.log(value);
  process.stdin.write(value);
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
    
    console.log("Password from store = ",store.get('password'));
    enterPasswordReceiveSend(store.get('password'));

   
   
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

            if(lockedPreviousTransaction != "0.000000000 "){
               document.getElementById("balanceWarningBox").style = "display: block;";
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
            if(isNumeric(totalBalance)){
              store.set('balance',totalBalance);
            }
            if(store.get('balance') != ""){
              document.getElementById("totalBalance").innerHTML = store.get('balance');
            }
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
  

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}