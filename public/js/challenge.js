$(document).ready(function() {

    $(".meter-m > span").each(function() {
          $(this)
            .data("origWidth", $(this).width())
            .width(0)
            .animate({
                width: $(this).data("origWidth")
            }, 1200);
    });
    
      $('.loginButtonForClick').click(()=>{
        $.cookie("redirectCookie", JSON.stringify({action:"FOWD_CHG",id:$('#challengeID').val()}));
        window.location.href = window.location.origin+"/login";
      })
      $('#btn-share').click(()=>{
        $('#exampleModalCenterExpShare').modal('show');            
      })
  
      document.getElementById("copyButton").addEventListener("click", copy_password);
      function copy_password(e) {
          e.preventDefault()
          navigator.clipboard.writeText('https://retosgamer.com/challenge?id='+$('#challengeID').val()).then(function () {
            $("#copyButton").html('Link copiado')
          });
      }
      var iframeHTML=$(($('#ytLinkTutorial').val())).prop( 'id','iframeTut');
      $('.modalVideoRow').html(iframeHTML);
     
  
      var isParticipated=$('#isParticipated').val();
      var endDateChallenge=$('#endTimeChallenge').val();
      if(isParticipated==='true'){
        $('#button_Join').prop('disabled', true);
        $('#button_Join_mobile').prop('disabled', true);
        $('#message_form_input').attr("placeholder", "Chatting publically as "+$('#userGameName').val());
      }
      if(endDateChallenge){
          $('#exampleModalCenterExp').modal('show');      
      }
     
  
      $('#closeFeedbackDialog').click(()=>{
        $.cookie('feedbackDialogShown:'+$('#challengeID').val(), 'true',{ expires: 1 });
      })
      $('#feedbackModalButton').click(()=>{
        $('#exampleModalCenterExpFeedback').modal('toggle');
        $.cookie('feedbackDialogShown:'+$('#challengeID').val(), 'true',{ expires: 1 });
      })
  
      $('#tutorialDialogButton').click(()=>{
        $('#ytVideoParticipationTutorial').modal('show');
      })
  
      $('#closeVideoDialog').click(()=>{
  
      var url = iframeHTML.attr('src');
      iframeHTML.attr('src', '');
        
        iframeHTML.attr('src', url);
        $('.modalVideoRow').html(iframeHTML)
      })
  
      $('#closePasswordDialog').click(()=>{
        var url = $('#iframeLobbyTut').attr('src');
        $('#iframeLobbyTut').attr('src', '');
          
        $('#iframeLobbyTut').attr('src', url);
      })
  
      
 
      if($('#passwordTimer').val()=='null' && $('#isMathEnded').val()!='true'){
      var time12=$('#challengeTime').val();
        var countDownDate1= new Date(time12).getTime()
  
        var now = new Date(moment.tz(new Date(), "GMT").utcOffset(-300).format("MM/DD/YYYY hh:mm:ss a")).getTime();
  
        var distance = countDownDate1 - now;
        var challengeTimeInterval=setInterval(function() {
        var timer="";
        var now = new Date(moment.tz(new Date(), "GMT").utcOffset(-300).format("MM/DD/YYYY hh:mm:ss a")).getTime();
        var distance = countDownDate1 - now;
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        if($('#passwordTimer').val()!='null' || $('#isMathEnded').val()=='true'){
          clearInterval(challengeTimeInterval);
        }
        if(days===0 && ($('#button_Join').html()!='Finalizado' || $('#button_Join_mobile').html()!='Finalizado')){
          document.getElementById('timeBanner').innerHTML =   '<i class="fa fa-clock-o" style="margin-right:0.5vw" aria-hidden="true"></i>'+hours + "hr " + minutes + "min "+ seconds+"sec ";  
        }
        else if(days>=1 && ($('#button_Join').html()!='Finalizado' || $('#button_Join_mobile').html()!='Finalizado')){ 
          document.getElementById('timeBanner').innerHTML = 'Starts en: '+days+" day(s)"
        }
        else {
          document.getElementById('timeBanner').innerHTML = 'Contraseña por anunciarse';
          // // $('#button_Join').prop('disabled', true);
          // //   $('#button_Join').css('background-color', 'gray');
          //   $('#button_Join').html('Participar<i class="fas fa-chevron-right" style="margin-left:1vw;"></i>(por empezar)');
  
          //   // $('#button_Join_mobile').prop('disabled', true);
          //   // $('#button_Join_mobile').css('background-color', 'gray');
          //   $('#button_Join_mobile').html('Participar<i class="fas fa-chevron-right" style="margin-left:1vw;"></i>(por empezar)');
           clearInterval(challengeTimeInterval);
        }
      },1000)
    }
  
  
      $('#passwordDialogButton').click(()=>{
        $('#exampleModalCenterExpPass').modal('toggle');
      })
  
       
      var j=0;
      $('#button_choose_image').click(function(){
        j=1;
      $('#inputGroupFile02').click();
      });
      //  $('#button_choose_image').click(function(e){
        
          // $('#fileName').html(e.target.files[0].name);
          $('#button_choose_image').html('participar <i class="fas fa-chevron-right" style="margin-left:1vw;"></i>');
          // $('#button_choose_image').unbind('click')
          $('#button_choose_image').click(function(){
            $('#button_choose_image').html('<div class="spinner-border" style="height:2vw;width:2vw;"></div>');
            $('#button_choose_image').prop('disabled', true);
            var formData = new FormData();
            // formData.append('file', $('#inputGroupFile02')[0].files[0]);
            formData.append('data', $('#inputScore').val());
            formData.append('data', $('#challengeID').val());
            $.ajax({
              url: window.location.origin+'/challenge',  
              type: 'POST',
              data: formData,
              success:function(data){
                $('#button_choose_image').prop('disabled', false);
 
                  if(data.status==="success" || data==='success'){
                   
                    $('#fileName').css("display","none");
                    $('#input-block').css("display","none"); 
                    $('#timeLeft').css("display","block");
                    $('#exampleModalLongTitle').html("¡Participacion exitosa!")
                    $('#button_choose_image').hide()
                    $('#modalBodyParticipate').empty()
                    $('#modalBodyParticipate').html('<div style="color:white;">Un admin anunciará la contraseña de sala pronto. Recibirás una notificacion en la página este reto (asegúrate de activar notificaciones en tu navegador). Una vez finalice el temporizador se anunciará la sala y deberás seguir los pasos en el tutorial dentro del juego.</div>')
                    $('#button_Join').html('Estas participando');
                    $('#button_Join').prop('disabled', true);
                    $('#button_Join_mobile').html('Estas participando');
                    $('#button_Join_mobile').prop('disabled', true);
                    $('#cancel_footer').html("Hecho");
                    $(document).on('hide.bs.modal','#participateModal', ()=>{
                      location.reload();
                    });

                    var spots=$('#spotsCount').val().split('/');
                    spots[0]=(parseInt(spots[0])+1).toString();
                    $('.spotsContainer2').html('<strong>'+spots[0]+"/"+spots[1]+'</strong>')
                    $('.progressBarStyleMobile').html('<span style="width:'+parseInt(spots[0])/parseInt(spots[1])*100+'%;"></span>');
          
                    if($('#passwordTimer').val()!='null'){
                      $('#passwordDialogButton').html('<i class="fa fa-info" style="margin-right: 0.6vw;" aria-hidden="true" disabled></i>Ver contraseña de sala');
  
                      $('#passwordDialogButton').attr('disabled' , false);
                    $('#modalVideo-PasswordRow').empty()
                    $('#modalVideo-PasswordRow').append('<p class="modalHeading">Contraseña</p>')
                    for(var i=0;i<JSON.parse(data.result).length;i++) {
                      $('#modalVideo-PasswordRow').append(`<h4 style="color: #B6B6B6;font-family: 'avenir';padding-bottom:1vw ;">`+JSON.parse(data.result)[i].key+`- <strong>`+
                                                                                                          JSON.parse(data.result)[i].value+`</strong></h4>`);
                    }        
                    var iframeLobbyVideoHTML=$(($('#ytLinkLobbyTutorial').val())).prop('id','iframeLobbyTut');
                    $('#modalVideo-PasswordRow').append('<p class="modalHeading">Como ingresar a la sala:</p>')
                    $('#modalVideo-PasswordRow').append(iframeLobbyVideoHTML)
                    $('.PasswordVideoRow').html(iframeLobbyVideoHTML)
                    $('#passwordDialogButton').click(()=>{
                      $('#exampleModalCenterExpPass').modal('toggle');
                    })
                  }
                  $('#message_form_input').prop('disabled', false);
                  $('#userGameName').val($('#inputScore').val())
                  $('#message_form_input').attr("placeholder", "Chatting publically as "+$('#inputScore').val());
                  $('#emojiBut').removeClass("removeClickEvent");
                  $('#emojiBut').prop('disabled', false);
                  
                  }
                  
                  else if(data.status==="PARTICIPATED"){
                    $('#button_choose_image').html('participar <i class="fas fa-chevron-right" style="margin-left:1vw;"></i>');
                    $('#userAlreadyParticipatedMsg').show()
                    window.setTimeout(()=>{
                      $('#userAlreadyParticipatedMsg').hide()
                    },8000)
                  }
                  else if(data.status==="SPOTS_FULL"){
                    $('#button_choose_image').html('Cupos llenos');
                    $('#spotsFullMessage').show()
                    window.setTimeout(()=>{
                      $('#spotsFullMessage').hide()
                    },8000)
                  }
              },
              cache: false,
              contentType: false,
              processData: false
            });
          });
        
      // }); 
      setTimeout(()=>{
        
        if(parseInt($('#isFull').val())>=1 && isParticipated!=='true'){
          $('#button_Join').css('background-color', 'black');
          $('#button_Join_mobile').css('background-color', 'black');
          $('#button_Join').css('border', '2px solid #707070');
          $('#button_Join_mobile').css('border', '2px solid #707070');
          $('#button_Join').html('Cupos llenos')
          $('#button_Join_mobile').html('Cupos llenos')
          $('#button_Join').prop('disabled', true);
          $('#button_Join_mobile').prop('disabled', true);
        }
        else{
          $('#button_Join').show();
          $('#button_Join_mobile').show();
        }
		if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            $('.mobile-otpimizeNav-cl').show();
		}
        
    },1000)
    
      //check password announcement
    const checkPasswordAnnouncement=()=>{
      var password=$('#password').val();
      var passwordTimer=$('#passwordTimer').val();
      if(passwordTimer!='null' ){
        $('#passwordDialogButton').html('Ver contraseña de sala<i class="fa fa-info" style="margin-left: 0.6vw;" aria-hidden="true" ></i>');
      }
      if(password!='null' ){
        $('#passwordDialogButton').attr('disabled' , false);
          for(var i=0;i<JSON.parse(password).length;i++) {
            
            $('#modalVideo-PasswordRow').append(`<h4 style="color: white;font-family: 'avenir-light';padding-bottom:1vw ;">`+JSON.parse(password)[i].key+`- <strong style="color:white;font-family: 'avenir';">`+
            JSON.parse(password)[i].value+`</strong></h4>`)
          }
          var iframeLobbyVideoHTML=$(($('#ytLinkLobbyTutorial').val())).prop('id','iframeLobbyTut');
          $('#modalVideo-PasswordRow').append(iframeLobbyVideoHTML)
          $('.PasswordVideoRow').html(iframeLobbyVideoHTML)
          if(typeof $.cookie("passwordDialogShown:"+$('#challengeID').val())   === 'undefined'){
            $.cookie('passwordDialogShown:'+$('#challengeID').val(), 'true',{ expires: 1 });
            $('#exampleModalCenterExpPass').modal('show');
          }         
      }
    

      if(passwordTimer!='null' && $('#isMathEnded').val()!='true'){
          var passwordTimerInterval=setInterval(function() {
          if($('#passwordTimer').val()!='null' && $('#isMathEnded').val()=='true'){
            clearInterval(passwordTimerInterval);
          }  
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
            $('#button_Join').css({"border-color": "#707070", "border-width":"2px", "border-style":"solid"});
            $('#button_Join').html('Sala en progreso');

            $('#button_Join_mobile').prop('disabled', true);
            $('#button_Join_mobile').css('background-color', 'black');
            $('#button_Join_mobile').css({"border-color": "#707070", "border-width":"2px", "border-style":"solid"});
            $('#button_Join_mobile').html('Sala en progreso');
            clearInterval(passwordTimerInterval)
          }
          else if(days==0){
            if(minutes>=8){
              document.getElementById('timeBanner').innerHTML =   'Ultimo llamado : '+(parseInt(minutes)-8).toString() + "min "+ seconds+"sec ";  
            }
            else{
              document.getElementById('timeBanner').innerHTML = 'Entra a la sala privada, comenzamos pronto';  
              $('#button_Join').prop('disabled', true);
              $('#button_Join').css('background-color', 'black');
              $('#button_Join').css({"border-color": "#707070", "border-width":"2px", "border-style":"solid",});
              $('#button_Join').html('Comienza en: '+minutes + "min "+ seconds+"sec");

              $('#button_Join_mobile').prop('disabled', true);
              $('#button_Join_mobile').css('background-color', 'black');
              $('#button_Join_mobile').css({"border-color": "#707070", "border-width":"2px", "border-style":"solid"});
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
              $('#button_Join').css({"border-color": "#707070", 
                                      "border-width":"2px", 
                                      "border-style":"solid",
                                      });
              $('#button_Join').html('Finalizado');
    
              $('#button_Join_mobile').css('background-color', 'black');
              $('#button_Join_mobile').css({"border-color": "#707070", 
                 "border-width":"2px", 
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
            $('#button_Join').css({"border-color": "#707070", 
                                    "border-width":"2px", 
                                    "border-style":"solid",
                                    });
            $('#button_Join').html('Finalizado');
  
            $('#button_Join_mobile').css('background-color', 'black');
            $('#button_Join_mobile').css({"border-color": "#707070", 
               "border-width":"2px", 
               "border-style":"solid"});
            $('#button_Join_mobile').html('Finalizado');
          }
          
          else if(distance<0){
            clearInterval(resultTimerInterval);
            
            $('#button_Join').css('background-color', 'black');
            
            $('#button_Join').css({"border-color": "#707070", 
            "border-width":"2px", 
            "border-style":"solid",
            });

            $('#button_Join_mobile').css({"border-color": "#707070", 
            "border-width":"2px", 
            "border-style":"solid"});
            $('#button_Join').html('Finalizado');
  
            $('#button_Join_mobile').css('background-color', 'black');

            $('#button_Join_mobile').html('Finalizado');   
            $('.loginButtonForClick').html('Finalizado'); 
            $('.loginButtonForClick').prop('disabled', true);
            $('.loginButtonForClick').css('background-color', 'black');
            if($('#resultData').val()!='null') resultPublishedState();
            else document.getElementById('timeBanner').innerHTML ="En unos instantes anunciamos resultados";
          }
        },1000)
      }
    }
    }
    const resultPublishedState=async()=>{
      let isThisWinner=false;
      isThisWinner=await isWinner(JSON.parse($('#tempSocketResultData').val()))
              
      $('#feedbackButton').show()            
      if(!$('#exampleModalCenterExpFeedback').hasClass('show') && typeof $.cookie("feedbackDialogShown:"+$('#challengeID').val()) === 'undefined'){
        $('#exampleModalCenterExpFeedback').modal('toggle');
      }
      $('.winnersName').show()
      document.getElementById('timeBanner').innerHTML ="Resultados anunciados"
      $('#matchEnded').prop('disabled', false);
      $('#matchEnded').html('partida finalizada <i class="fas fa-external-link-alt"style="margin-left: 0.6vw;" ></i>')
      $('#matchEnded').click(()=>{
        window.open(window.location.origin+'/leaderBoardChallenge?id='+$('#challengeID').val(), "_blank") 
      })
      if(isThisWinner){
        $('.feedbackWinnerRow').show();
        if($.cookie("feedbackDialogShown:"+$('#challengeID').val()) === 'undefined'){
          $('.canvas1').show(); 
          confettiAnimation();
        }
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
    checkPasswordAnnouncement();
    checkChallengeEnded();
  });