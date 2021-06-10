// $(document).ready(function () {
/***
 *  let socket = io('/', {
  secure: true,
  rejectUnauthorized: false,
  path: 'mysocket/socket.io'
});
 */
$(document).ready(function () {
    let socket = io({"transports": ['websocket'],upgrade: false});
    var buttonIdCount=0;
    var audioElement = document.createElement('audio');
    audioElement.setAttribute('src', 'https://proxy.notificationsounds.com/notification-sounds/sharp-592/download/file-sounds-1139-sharp.mp3');    
    var isBlocked;   
    var messageCounter=0;
    const messageTimer=1000;
    var spamTimer=null;
    var spamTimeout=null;
    let isLoaded=false;

    (async function () {

        let username = $('#userGameName').val();
        if (!username) { username = "Anonymous_User"; }

        //save username also on the client's socket.
        socket.username = username;
        


        //Let the socket at the server "know" the value of the username. Each client will have their own username.
        socket.emit('username', socket.username);
        const checkBlocked=async()=>{
            let opts={'userName':socket.username,'ID':$("#challengeID").val()}
            $.ajax({
                url: window.location.origin+"/checkIfBlocked",  
                type: 'POST',
                data: opts,
                success:(isBlockedResponse)=>{
                    if(isBlockedResponse){
                       isBlocked=true;
                    }
                    else{
                        isBlocked=false;
                    }
                }
            });    
        }
       await checkBlocked();

    })();

    // -------------------------------------------------
    //SOCKET.ON FUNCTIONS:
    socket.on('userConnected', (usernameThatJustConnected) => { 
        if(!isLoaded){
            const username_no_white_space = removeWhiteSpaceFromUsername(usernameThatJustConnected)
            let opts={'ID':$("#challengeID").val()}
            $.ajax({
                url: window.location.origin+"/loadChat",  
                type: 'POST',
                data: opts,
                success:function(response){
                    isLoaded=true;
                    // response.length>10?response.slice()
                    response.map(data  =>  {
    
                        var name = data.sender;
                        var date= data.timeStamp;
                        var diffDays=0;
                        if(typeof(date)!=='undefined'){
                            let now=new Date (moment.tz(new Date(), "GMT").utcOffset(-300).format("MM/DD/YYYY hh:mm:ss a"));
                            let chatDate=new Date(date);
                            const diffTime = Math.abs(now - chatDate);
                            diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                        }
                        if(diffDays>0){
                            // var li = `<div id="parentCenter">
                            // <div id="childCenter">` 
                            // +diffDays>1?'<li class="blockNotification"> <strong>'+diffDays+' ago</strong> <li>': '<li class="blockNotification"> <strong>Yesterday</strong> <li>'
                            // + `</div></div>`;
                            // $('#messages').append(li);
                        }
                        var initials='#'
                        if(typeof(name)!=='undefined'){
                            initials= name.charAt(0).toUpperCase()
                        }
                        let msg_with_style="";
                        let automated_response="";
                        if(data.sender === socket.username){
                                msg_with_style = `<div id="parentRight">
                                <div id="childRight">` 
                                + data.message 
                                + `</div> 
                                <div id="chatIconContainer">
                                <div id="chatIcon">`+initials+`</div></div></div>`;
    
                            if(data.automatedRes!=null)
                                automated_response = `<div id='parentLeft'>
                                <div id="chatIconContainer">
                                <div id="chatIcon" class='chatIconAdmin' >R</div></div><div id="childLeft">` +  data.automatedRes  + `</div></div>`;       
                        }  
                        else{
                            if(socket.username=='Admin'){
                                msg_with_style = `<div id='parentLeft'>
                                <div id="chatIconContainer">
                                <div id="chatIcon">`+initials+`</div></div>
                                <div id="childLeft">
                                <button type="button" class="btn btn-warning loda" id="blockButton`+buttonIdCount+`" value=${name} >BLOCK</button>` + 
                                data.message + 
                                `</div></div>`;
                                
                                $(document).on('click',"#blockButton"+buttonIdCount,function(){
                                    let blockUserObj={'userName':$(this).val(),'ID':$("#challengeID").val()}
                                    socket.emit('blockUser(client->server)', JSON.stringify(blockUserObj));
                                })
    
                            
    
                                buttonIdCount+=1;
                            }
                            else{
                                msg_with_style = `<div id='parentLeft'>
                                <div id="chatIconContainer">
                                <div id="chatIcon">`+initials+`</div></div><div id="childLeft">` + data.message + `</div></div>`; 
                            }  
                        }    
                        $('#messages').append(msg_with_style);
                        if(!data.automatedRes!=null && automated_response!=""){$('#messages').append(automated_response);}
    
                        document.getElementById('messages_center').scrollTo(0, document.getElementById('messages_center').scrollHeight);
                        
                    });
    
                },
                error:function (error) {
                }
            })
        }

        //add to username_is_typing_board the user's div
        // $('#username_is_typing_board').append( username_no_white_space + "is typing...");
    });
    socket.on('userDisconnected', (usernameThatJustDisonnected) => { //() => {} is a nameless function   
        // var spamMsg=`<div id="parentCenter">
        //                 <div id="childCenter">` 
        //                 +'<li id="disconnectedNotif" ><a><i class="fas fa-redo"></i> Reload</a>you are disconnected from server<li>'
        //                 + `</div></div>`;
                        
        // $('#message_form_input').prop( "disabled", true );

        // $('#messages').append(spamMsg);

        
        // $('#username_is_typing_board').css('display', 'invisible');
        // $('#username_is_typing_board').html('typing..')
    });
    socket.on('updateNumUsersOnline', (num_users_online) => {
        $('#num_users_online_number').html('<h3>' + num_users_online + ' Users Online</h3>');
    });


    //on socket event of "addChatMessage(server->clients)", do the following: (add the value to the messages list)
    socket.on('addChatMessage(server->clients)', function (usernameAndMsg) {
        if(usernameAndMsg[2]===$("#challengeID").val()){
            let username_adding_msg = usernameAndMsg[0];
            let msg = usernameAndMsg[1];

            var name = username_adding_msg;
            var initials = name.charAt(0).toUpperCase();
            //set different backgroud for the user that sent the message:
            let msg_with_style="";
            let automated_response="";
            if(username_adding_msg === socket.username) {
                msg_with_style = `<div id="parentRight"><div id="childRight">` 
                + msg + `</div> 
                <div id="chatIconContainer">
                <div id="chatIcon">`+initials+`</div></div></div>`;
                if(usernameAndMsg[3]!=null)
                automated_response = `<div id='parentLeft'>
                <div id="chatIconContainer">
                <div id="chatIcon" class='chatIconAdmin' >R</div></div><div id="childLeft">` +  usernameAndMsg[3]  + `</div></div>`;
            }
          
            
            else{ 
                audioElement.play();
                if(socket.username==='Admin'){
                    msg_with_style = `<div id='parentLeft'>
                            <div id="chatIconContainer">
                            <div id="chatIcon">`+initials+`</div></div><div id="childLeft">
                            <button type="button" id="blockButton`+buttonIdCount+`" value=${name} class="btn btn-warning loda" >BLOCK</button>` + 
                            msg + 
                            `</div></div>`;

                            $(document).on('click',"#blockButton"+buttonIdCount,function(){
                                let blockUserObj={'userName':$(this).val(),'ID':$("#challengeID").val()}
                                socket.emit('blockUser(client->server)', JSON.stringify(blockUserObj));
                            })

                            buttonIdCount+=1;
                }
                else{
                msg_with_style = `<div id='parentLeft'>
                <div id="chatIconContainer">
                <div id="chatIcon">`+initials+`</div></div><div id="childLeft">` +  msg  + `</div></div>`;
                }
            }
            $('#messages').append(msg_with_style);
            
            if(!usernameAndMsg[3]!=null && automated_response!=""){
                setTimeout(()=>{
                    audioElement.play();
                    $('#messages').append(automated_response);
                },2000);
            } 
            document.getElementById('messages_center').scrollTo(0, document.getElementById('messages_center').scrollHeight);
       }
    });

    // -------------------------------------------------
    //add to our form a submit attribue (with the following function):
    // sending a message to the chat:
    $('#message_form').submit((e)=> {
        var idClicked=$(document.activeElement).attr('id');
        var msg= $('#'+$(document.activeElement).attr('id')).html()
                e.preventDefault();
                if(isBlocked){
                    var li = `<div id="parentCenter">
                    <div id="childCenter">` 
                    + '<li class="blockNotification"> <strong>You are currently blocked from this chat</strong> <li>'
                    + `</div></div>`;
                    $('#messages').append(li);
                }
                else{
                        
                    if(messageCounter>3){
                          
                        var randomizedId=Math.floor(Math.random() * 1000);  
                        if(this.spamTimer==null){
                            var messageCounterTimer=30;
                            var spamMsg=`<div id="parentCenter">
                        <div id="childCenter">` 
                        +'<li id="spamTimer'+randomizedId+'" >  <li>'
                        + `</div></div>`;
                            this.spamTimer=window.setInterval(()=>{
                                messageCounterTimer-=1;
                                $('#spamTimer'+randomizedId).html('Puedes volver a chatear en '+messageCounterTimer+' segundos');
                                $('#username_is_typing_board').css('visibility', 'hidden');
                                $('#username_is_typing_board').html('typing..')
                            },messageTimer)
                            $('#messages').append(spamMsg);
                        }
                        if(this.spamTimeout==null){
                            this.spamTimeout=window.setTimeout((e) => {
                                clearTimeout(this.spamTimer)

                                messageCounter=0;   
                                this.spamTimer=null;
                                this.spamTimeout=null
                                $('#spamTimer'+randomizedId).html('¡Ya puedes volver a chatear!');
                                
                            }, 30000);  
                        } 
                           
                                      
                    }
                    else{
                        messageCounter+=1
                        let user_message = msg;
                        if (user_message === "") {
                            return false; 
                        }
                        let msgObject={'msg':msg,'ID':$("#challengeID").val()}
                        if(idClicked=='chatMsg14')
                            msgObject['automatedRes']='¡Por supuesto!, utiliza el siguiente formulario: https://forms.gle/MY96YTD1Gv8EZt5g8';
                        
                        else if(idClicked=='chatMsg12')
                            msgObject['automatedRes']=`¡Felicidades, ${socket.username}! Deberás aguardar a que tu balance se actualice con las Retos Coins ganadas en este evento. Luego, podrás retirar tu saldo en la sección de "Mi cuenta".`;
                        
                        else if(idClicked=='chatMsg11')
                            msgObject['automatedRes']='🎉🎊';
                        
                        else if(idClicked=='chatMsg10')
                            msgObject['automatedRes']='Dirígete al chat que encontrarás en la parte inferior derecha del sitio web, para recibir la atención de un administrador. '; 
                        
                        else if(idClicked=='chatMsg9')
                            msgObject['automatedRes']='Dirígete al chat que encontrarás en la parte inferior derecha del sitio web, para recibir la atención de un administrador. ';
                        
                        else if(idClicked=='chatMsg5')
                            msgObject['automatedRes']=`¡Bienvenido, ${socket.username}, suerte en tus partidas!`;
                           
                            
                            
                        socket.emit('addChatMessage(client->server)', JSON.stringify(msgObject));                          
                        return false; 
                    }
                   
                }
    });
        

 
    var typingTimer=null; //setTimeOut() identifier;
    var doneTypingInterval = 2000;
    //notify server on keydown
    $('#message_form_input').on("keydown", function (e) {
        //log 'is typing...' only if the key is printable
        if (isPrintableKey(e) && !(isBlocked)) socket.emit('userIsTypingKeyDown(client->server)', $("#challengeID").val());
    });

    //notify server on keyup
    $('#message_form_input').on("keyup", function (e) {
        if (isPrintableKey(e) && !(isBlocked)) socket.emit('userIsTypingKeyUp(client->server)', $("#challengeID").val());
    });

    //handle keydown by some user
    socket.on('userIsTypingKeyDown(server->clients)', function (usernameAndIsTyping) {
        const usernameTyping_no_white_space = removeWhiteSpaceFromUsername(usernameAndIsTyping[0]);
        //new pressing of a key, don't want to remove is_typing notification from previous keyup event.
        if($("#challengeID").val()===usernameAndIsTyping[2]){
            if (typingTimer) {
                clearTimeout(typingTimer); //cancel the previous timer.
                typingTimer = null;
            }        
    
            //check if the username that is typing has a li in the board of is_typing. if not, add one.
            if ($.trim($("#username_is_typing_board").html())=='typing..') {
                $('#username_is_typing_board').css('visibility', 'visible');
                $('#username_is_typing_board').html(usernameTyping_no_white_space + ' is typing '+'  <span class="dots-cont"> <span class="dot dot-1"></span> <span class="dot dot-2"></span> <span class="dot dot-3"></span> </span>');
            }
            else if($.trim($("#username_is_typing_board").html()).includes('is typing') && !$.trim($("#username_is_typing_board").html()).includes(usernameTyping_no_white_space)){
                $('#username_is_typing_board').css('visibility', 'visible');
                $('#username_is_typing_board').html('Multiple users are typing '+'  <span class="dots-cont"> <span class="dot dot-1"></span> <span class="dot dot-2"></span> <span class="dot dot-3"></span> </span>');
            }
        }
        //if this is the first time typing in the current typing session, edit the notification:
    });

    //handle keyup by some user
    socket.on('userIsTypingKeyUp(server->clients)', function (usernameTyping) {
        //start count down (again?) to disappear the is_typing notification.
        if($("#challengeID").val()===usernameTyping[1]){
            typingTimer = window.setTimeout(() => {
                $('#username_is_typing_board').css('visibility', 'hidden');
                $('#username_is_typing_board').html('typing..')
            }, doneTypingInterval);
        }
    });
    socket.on('blockUser(server->clients)', function (response) {
        if(response[0]==='success'){
            audioElement.play();
            var li = `<div id="parentCenter">
            <div id="childCenter">` 
            + '<li class="blockNotification"> <strong>Admin Blocked '+response[1]+' </strong> <li>'
            + `</div></div>`;
            $('#messages').append(li);
        }
    });
    socket.on('passwordAnnounced',(payload)=>{
        if(payload.challengeID===$("#challengeID").val()){
                $('#password').val(payload.password);
                $('#passwordTimer').val(payload.passwordTimer);
                $('#ytLinkLobbyTutorial').val(payload.ytLinkLobbyTutorial);
                checkPasswordAnnouncement();
        }
    })
    socket.on('challengeEnded',(payload)=>{
        if(payload.challengeID===$("#challengeID").val()){
            $('#resultTimer').val(payload.resultTimer);
            $('#isMathEnded').val(payload.isMatchEnded);
            checkChallengeEnded();
        }
    })
    socket.on('challengeUpdated',(payload)=>{
        if(payload.challengeID===$("#challengeID").val()){
            let link=`https://twitter.com/intent/tweet?text=¡Ven y participa conmigo en el reto ${payload.challengeName}, 
                    de Retos Gamer! ¡Únete a Retos Gamer y participa por grandes PREMIOS!
                    &url=https://retosgamer.com/challenge?id=${payload.challengeName}`;
            $('#nameBanner').html(`<strong>${payload.challengeName}</strong>`)        
            $("#twitterShareLink").attr("href", link)

            $('#challengeType').html(payload.challengeType)
            $('#challengeRules').html(payload.challengeRules)
            $('#challengeDescription').html(payload.challengeDescription)
            $('#endTimeChallenge').html(payload.end_time)
            $('#challengeTime').html(payload.challengeTime)
        }
    })
    
    socket.on('updateSpots',(challengeID)=>{
        if(challengeID===$("#challengeID").val()){

        let spots=$('#spotsCount').val();
        spots=spots.split('/');
        let joined=parseInt(spots[0])+1
        let total=parseInt(spots[1])
        var isParticipated=$('#isParticipated').val();
        if(joined===total && isParticipated!='true'){
          $('#button_Join').css('background-color', 'gray');
          $('#button_Join_mobile').css('background-color', 'gray');
          $('#button_Join').html('Cupos llenos')
          $('#button_Join_mobile').html('Cupos llenos')
          $('#button_Join').prop('disabled', true);
          $('#button_Join_mobile').prop('disabled', true);
        }
        $('#spotsText').html(`<strong>${joined.toString()}/${spots[1]}</strong>`)
        $('#spotsWidth').width(`${(joined/total)*100}%`)
        }
    });
    var isChallengeEndedTimerFinished=false;
    socket.on('notifyResultsPublished',(payload)=>{
      if(payload.challengeID===$("#challengeID").val()){
        $('#tempSocketResultData').val(payload.resultData);   
        if(isChallengeEndedTimerFinished) resultPublishedState();
      }
    })

    socket.on('notifyChallengeDeleted',(challengeID)=>{
        if(challengeID===$("#challengeID").val()){
            $('#challengeDeletedInfoModal').modal({
                backdrop: 'static',
                keyboard: false
            })
            $('#challengeDeletedInfoModal').modal('toggle');
            
        }
    })

    
    //check password announcement
    const checkPasswordAnnouncement=()=>{
        var password=$('#password').val();
        var passwordTimer=$('#passwordTimer').val();
        if(passwordTimer!='null' ){
          $('#passwordDialogButton').html('Ver contraseña de sala<i class="fa fa-info" style="margin-left: 0.6vw;" aria-hidden="true" ></i>');
        }
        if(password!='null' && $('#isParticipated').val()=='true'){
          $('#passwordDialogButton').attr('disabled' , false);
            for(var i=0;i<JSON.parse(password).length;i++) {
              $('#modalVideo-PasswordRow').append('<h4 style="color: white;padding-bottom:1vw ;">'+JSON.parse(password)[i].key+': <strong>'+
              JSON.parse(password)[i].value+'</strong></h4>')
            }
            var iframeLobbyVideoHTML=$(($('#ytLinkLobbyTutorial').val())).prop('id','iframeLobbyTut');
            $('#modalVideo-PasswordRow').append(iframeLobbyVideoHTML)
            if(typeof $.cookie("passwordDialogShown:"+$('#challengeID').val())   === 'undefined'){
              $.cookie('passwordDialogShown:'+$('#challengeID').val(), 'true',{ expires: 1 });
              $('#exampleModalCenterExpPass').modal('show');
            }    
        }
      
  
        if(passwordTimer!='null' && $('#isMathEnded').val()!='true'){
            var passwordTimerInterval=setInterval(function() {
            if($('#isMathEnded').val()=='true') clearInterval(passwordTimerInterval);
            var now = moment(moment.tz(new Date(), "GMT").utcOffset(-300).format("MM/DD/YYYY hh:mm:ss a"),'MM/DD/YYYY hh:mm:ss a').valueOf()
            var distance = moment(moment.tz(passwordTimer, "GMT").format("MM/DD/YYYY hh:mm:ss a"),'MM/DD/YYYY hh:mm:ss a').valueOf() - now;
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);
  
            if(distance<0){
              document.getElementById('timeBanner').innerHTML ="La sala ha comenzado"
              $('#button_Join').prop('disabled', true);
              $('#button_Join').css('background-color', 'black');
              $('#button_Join').css({"border-color": "red", "border-width":"1px", "border-style":"solid",});
              $('#button_Join').html('Sala en progreso');
  
              $('#button_Join_mobile').prop('disabled', true);
              $('#button_Join_mobile').css('background-color', 'black');
              $('#button_Join_mobile').css({"border-color": "red", "border-width":"1px", "border-style":"solid"});
              $('#button_Join_mobile').html('Sala en progreso');
              clearInterval(passwordTimerInterval)
            }
            else if(days==0){
              if(minutes>=8){
                document.getElementById('timeBanner').innerHTML =   'Ultimo llamado : '+(parseInt(minutes)-8).toString() + "min "+ seconds+"sec ";  
              }
              else{
                document.getElementById('timeBanner').innerHTML = 'Join the lobby Match will be started soon';  
                $('#button_Join').prop('disabled', true);
                $('#button_Join').css('background-color', 'black');
                $('#button_Join').css({"border-color": "red", "border-width":"1px", "border-style":"solid",});
                $('#button_Join').html('Comienza en: '+minutes + "min "+ seconds+"sec");
  
                $('#button_Join_mobile').prop('disabled', true);
                $('#button_Join_mobile').css('background-color', 'black');
                $('#button_Join_mobile').css({"border-color": "red", "border-width":"1px", "border-style":"solid"});
                $('#button_Join_mobile').html('Comienza en: '+minutes + "min "+ seconds+"sec");
              }
            }
          
          else{
  
            document.getElementById('timeBanner').innerHTML =   'Starts en: '+days+" day(s)";  
          }
          },1000)
        }
      }

      const checkChallengeEnded=()=>{
        if($('#isMathEnded').val()=='true'){
          $('#passwordDialogButton').hide()
          $('#matchEnded').show()
          
          $('#time').hide()
    
          $('#button_Join').prop('disabled', true);
          $('#button_Join_mobile').prop('disabled', true);
    
        if($('#resultTimer').val()!='null'){
          var now = new Date(moment.tz(new Date(), "GMT").utcOffset(-300).format("MM/DD/YYYY hh:mm:ss a")).getTime();
          var distance = new Date(($('#resultTimer').val())).getTime() - now;
          var resultTimerInterval=setInterval(function() {
            var timer="";
            var now = new Date(moment.tz(new Date(), "GMT").utcOffset(-300).format("MM/DD/YYYY hh:mm:ss a")).getTime();
            var distance = new Date(($('#resultTimer').val())).getTime() - now;
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);
            if(days>0 && distance>0){
                document.getElementById('timeBanner').innerHTML = 'Resultados se anuncian en: '+days+' day(s)';  
                $('#button_Join').css('background-color', 'black');
                $('#button_Join').css({"border-color": "gray", 
                                        "border-width":"1px", 
                                        "border-style":"solid",
                                        });
                $('#button_Join').html('Finalizado');
      
                $('#button_Join_mobile').css('background-color', 'black');
                $('#button_Join_mobile').css({"border-color": "gray", 
                   "border-width":"1px", 
                   "border-style":"solid"});
                $('#button_Join_mobile').html('Finalizado');
            }
            else if(days===0 && distance>0){
                if(hours>0){
                    document.getElementById('timeBanner').innerHTML = 'Resultados se anuncian en: '+hours + "hrs "+minutes + "min "+ seconds+"sec ";  
                }
                else if(hours==0){
                    document.getElementById('timeBanner').innerHTML =minutes==0? 'Resultados se anuncian en: '+seconds + "sec ":  'Resultados se anuncian en: '+minutes + "min "+ seconds+"sec ";  
                }
              $('#button_Join').css('background-color', 'black');
              $('#button_Join').css({"border-color": "gray", 
                                      "border-width":"1px", 
                                      "border-style":"solid",
                                      });
              $('#button_Join').html('Finalizado');
    
              $('#button_Join_mobile').css('background-color', 'black');
              $('#button_Join_mobile').css({"border-color": "gray", 
                 "border-width":"1px", 
                 "border-style":"solid"});
              $('#button_Join_mobile').html('Finalizado');
            }
            else if(distance<0){
                clearInterval(resultTimerInterval);
                isChallengeEndedTimerFinished=true;  
              $('#button_Join').css('background-color', 'gray');
              $('#button_Join').html('Finalizado');
    
              $('#button_Join_mobile').css('background-color', 'gray');
              $('#button_Join_mobile').html('Finalizado');   
              $('.loginButtonForClick').html('Finalizado'); 
              $('.loginButtonForClick').prop('disabled', true);
              $('.loginButtonForClick').css('background-color', 'gray');
              if($('#tempSocketResultData').val()!="null") resultPublishedState();  
              else document.getElementById('timeBanner').innerHTML ="En unos instantes anunciamos resultados";
            }
          },1000)
        }
      }
    }
    const resultPublishedState=async()=>{
        
        $('#feedbackButton').show()   
                         
        if(!$('#exampleModalCenterExpFeedback').hasClass('show') && typeof $.cookie("feedbackDialogShown:"+$('#challengeID').val()) === 'undefined'){
          $('#exampleModalCenterExpFeedback').modal('toggle');
        }
        document.getElementById('timeBanner').innerHTML ="Resultados anunciados"
        $('#matchEnded').prop('disabled', false);
        $('#matchEnded').html('partida finalizada <i class="fas fa-external-link-alt"style="margin-left: 0.6vw;" ></i>')
        $('#matchEnded').click(()=>{
          window.open(window.location.origin+'/leaderBoardChallenge?id='+$('#challengeID').val(), "_blank") 
        })
        $('.winnersName').show()
        let isThisWinner=false;
        isThisWinner=await isWinner(JSON.parse($('#tempSocketResultData').val()))
        if(isThisWinner){
            $('.feedbackWinnerRow').show();
            $('.canvas1').show(); 
            confettiAnimation();
            $(document).on('hide.bs.modal','#exampleModalCenterExpFeedback', ()=>{
            $('.canvas1').remove()
            });
        } 
    }
    const isWinner=async (resultData)=>{
        const requests =resultData.map(unitResult => {
            if(unitResult.email==$('#userEmail').val()){
                return true;
            }
          });
        return await Promise.all(requests).then(data=>{return typeof(data[0])==='undefined'? false: true});
    }

    const confettiAnimation=()=>{
            window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;
            var canvas = document.querySelector("canvas");
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight;
            var ctx = canvas.getContext("2d");
            ctx.globalCompositeOperation = "source-over";
            var particles = [];
            var pIndex = 0;
            var x, y, frameId;
            
            function Dot(x,y,vx,vy,color){
              this.x = x;
              this.y = y;
              this.vx = vx;
              this.vy = vy;
              this.color = color;
              particles[pIndex] = this;
              this.id = pIndex;
              pIndex++;
              this.life = 0;
              this.maxlife = 600;
              this.degree = getRandom(0,360);
              this.size = Math.floor(getRandom(15,20));
            };
            
            Dot.prototype.draw = function(x, y){
            
              this.degree += 1;
              this.vx *= 0.99;
              this.vy *= 0.999;
              this.x += this.vx+Math.cos(this.degree*Math.PI/180);
              this.y += this.vy;
              this.width = this.size;
              this.height = Math.cos(this.degree*Math.PI/45)*this.size;
              ctx.fillStyle = this.color;
              ctx.beginPath();
              ctx.moveTo(this.x+this.x/2, this.y+this.y/2);
              ctx.lineTo(this.x+this.x/2+this.width/2, this.y+this.y/2+this.height);
              ctx.lineTo(this.x+this.x/2+this.width+this.width/2, this.y+this.y/2+this.height);
              ctx.lineTo(this.x+this.x/2+this.width, this.y+this.y/2);
              ctx.closePath();
              ctx.fill();
              this.life++;
              
              if(this.life >= this.maxlife){
                delete particles[this.id];
              }
            }
            window.addEventListener("resize", function(){
              canvas.width = window.innerWidth;
              canvas.height = window.innerHeight;
              x = canvas.width / 2;
              y = canvas.height / 2;
            });
            
            function loop(){
            
              ctx.clearRect(0,0, canvas.width, canvas.height);
              if(frameId % 3 == 0) {
                new Dot(canvas.width*Math.random()-canvas.width+canvas.width/2*Math.random(), -canvas.height/2, getRandom(1, 3),  getRandom(2, 4),"#FFFFE0");
                  new Dot(canvas.width*Math.random()-canvas.width+canvas.width/2*Math.random(), -canvas.height/2, getRandom(1, 3),  getRandom(2, 4),"#ED1A3D");
                  new Dot(canvas.width*Math.random()+canvas.width-canvas.width*Math.random(), -canvas.height/2,  -1 * getRandom(1, 3),  getRandom(2, 4),"#FFF");
              }
              for(var i in particles){
                particles[i].draw();
              }
              frameId = requestAnimationFrame(loop);
            }
            
            loop();
            
            function getRandom(min, max) {
              return Math.random() * (max - min) + min;
            }
    }
});

//remove white spaces from username FOR THE ID, if there's any
function removeWhiteSpaceFromUsername(username) {
    return username.replace(/\s/g, "")
}

function isPrintableKey(key_event) {
    if (key_event.key.length === 1) return true;
    return false;
}






/*if($('#tempSocketResultData').val()!="null"){
                let resultData=JSON.parse($('#tempSocketResultData').val());
                var isWinner=false;
                resultData.map((dataI, index)=>{
                    if(index<resultData.length-1){
                        if(dataI.email==$('#userEmail').val()){
                            isWinner=true;
                            return;
                        }
                    }
                    else{
                        if(dataI.email==$('#userEmail').val()){
                            isWinner=true;
                            return;
                        }
                    }
                }) 
               */


     