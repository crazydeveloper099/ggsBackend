
var monthShortNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];


  var load = (e)=> {
    $(".trans-list").html('')
      for (var i = 0; i < e.length; i++) {
          var transactionID="";
          if (e[i].action == "acreditado") {
            var action = "trans-plus";
            var color = "green";
          } else {
            var action = "trans-minus";
            var color = "blue";
          }
          if (e[i].status == "pending") {
            var html='<i class="fas fa-history" style="margin-right:0.5vw;"></i> Solicitud de retiro pendiente a verficación'
          } else {
            var html='<i class="far fa-check-circle" style="margin-right:0.5vw;"></i> Tu premio se acreditó correctamente'
          }
          if(e[i].action==='debit'){
            var actionText='retiro';
          }
          else{
            var actionText='crédito'
          }
          if('transactionID' in e[i]){
            transactionID=e[i].transactionID
          }
          var thatDate=new Date(e[i].createdAt);
          var hours=thatDate.getHours()<10?'0'+(thatDate.getHours()).toString():(thatDate.getHours()).toString();
          var mins=thatDate.getMinutes()<10?'0'+(thatDate.getMinutes()).toString():(thatDate.getMinutes()).toString();
          var formattedDate=thatDate.getDate()+' '+monthShortNames[thatDate.getMonth()]+' '+thatDate.getFullYear()+', '+
                    hours+':'+mins;

          $(".trans-list").append(
            ' <div class="trans trans-' +action +'">\
            <div class="trans-details">\
            \
            <h3 class="trans-name">' +
            
            '<strong style="font-weight:400;">'+actionText+'</strong>' +" "+transactionID+
            '</h3>\
            <h5 class="trans-type-date" >' +
            '<div class="trans-status-border">'+html+'</div>' +
            formattedDate+
                '</h5>\
            </div>\
            <div class="trans-amt">\
            <h4 class="trans-amt amt-' +color +'">' +
            e[i].value +" coin(s)"+
            "</h4>\
            </div>\
            </div><hr class='hr-style'/>"
          ).show('fast');
      }    
  }
  
  
  // clear trans list
  var clearTrans = function(){
      $(".trans-list").empty().hide();
  }
  
  
  
  // no trans
  var noTrans = function() {
    $(".trans-list").html('')

      $('.trans-list').children().length == 0 ? $(".trans-list").append(`<div style="width: 100%; height:100%; display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: center;" >
      <div class="rg-logo-footer" style="color:white;"><i class="fas fa-wallet"></i></div>
        <h6 style="color: #a8a8a8;font-family: 'avenir-light';">Aqui verás todas tus transacciones</h6>
      </div>`).show('fast') :"";
  }
  
  // load inital data
  $(document).ready(function() {
    $('#withdrawButton').prop('disabled', true);
    $('#balance').html('<img class="coin-icon" src="/images/coinIcon.png" alt=""/>'+$('#wallet_balance').val()+' coins<div class="coin-value">(1 coin= $1000.00 COP)</div>');
    
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      $('.mobile-otpimizeNav-cl').show();
    }
    $(".show-modal").click(function(){
      $("#declarationForm").modal({
          backdrop: 'static',
          keyboard: false
      });
  });

  
    $.get( "/fetchTransactions", async( data )=> {
      if(data!=null && data.length>0){
        
        await data.sort((a, b)=> {return (a.createdAt < b.createdAt) ? 1 : ((a.createdAt > b.createdAt) ? -1 : 0)});
        load(data)
        $('#withdrawButton').prop('disabled', false);


      }
      else{
        noTrans()
      }
    });
    $('#withdrawButton').on('click',()=>{
      $('#amountInputModal').modal('show')
    }) 
    $('#buttonWithdraw').on('click',()=>{

      if(parseInt($('#wallet_balance').val())<parseInt($('#inputCoins').val()) || parseInt($('#inputCoins').val())<0){
        $('#emptyAmountMSG').slideUp();   
        $('#insufficientAmountMSG').slideDown();
      }
      if($('#inputCoins').val().length===0){
        $('#insufficientAmountMSG').slideUp();
        $('#emptyAmountMSG').slideDown();   
      }
      if($('#inputName').val().length===0){
        $('#emptyNameMSG').slideDown();
      }
      if($('#inputColID').val().length===0){
        $('#emptyIDMSG').slideDown();
         
      }
      if($('#inputCity').val().length===0){
        $('#emptyCityMSG').slideDown();  
      }
      else if(parseInt($('#wallet_balance').val())>=parseInt($('#inputCoins').val()) && 
      parseInt($('#inputCoins').val())>0 &&
      $('#inputCoins').val().length>0 && 
      $('#inputName').val().length>0 && 
      $('#inputColID').val().length>0 && 
      $('#inputCity').val().length>0){
        hideErrors();
        openDeclerationForm();
      }
    }) 
    
  });

  const hideErrors=()=>{
    $('#insufficientAmountMSG').slideUp();
    $('#emptyNameMSG').slideUp();
    $('#emptyIDMSG').slideUp();
    $('#emptyCityMSG').slideUp();  
    $('#emptyAmountMSG').slideUp();  
  }


  const openDeclerationForm=()=>{

    $('#amountInputModal').modal('hide');
    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      let date=new Date();
      let dayName = days[date.getDay()];
      let dateNumber=date.getDate();
      let month=date.getMonth()+1;
      let year=date.getFullYear()
    let formData = new FormData();
		    formData.append('name', $('#inputName').val());
		    formData.append("amount",$('#inputCoins').val());
				formData.append("colID",$('#inputColID').val());
				formData.append("city",$('#inputCity').val());
        formData.append("dayName",dayName);
				formData.append("dateNumber",dateNumber);
				formData.append("month",month);
				formData.append('year',year);
        formData.append('timestamp',date);
          setTimeout(()=>{
            $('#modalFormBody').html(
            `Con la presente hacemos constar la entrega de ${parseInt($('#inputCoins').val())*1000}COP (Equivalente a ${$('#inputCoins').val()} monedas virtuales redimidas), al ganador(a) ${$('#inputName').val()} identificado(a) con C.C. No. ${$('#inputColID').val()}, de ${$('#inputCity').val()}, correspondiente a las actividades realizadas por Retos Gamer, Dicho premio será entregado únicamente luego de que la verificación -llevada a cabo por el operador- de la titularidad de la línea telefónica haya sido exitosa. Asi mismo, el ganador será notificado mediante un correo electrónico a su email registrado con la plataforma, luego de que el proceso haya sido concretado. 
            <br><br>  
            <strong>LÍNEA GANADORA: ${$('#phone').val()}</strong>
            <br><br>
            Adicionalmente, autorizo la publicación de mi nombre y fotografías como testimoniales para Retos Gamer.
            <br><br>
            Esta constancia se firma en la ciudad de Bogotá, a los ${dateNumber} días del mes de ${month} de ${year}. Premio recibido libre de cualquier costo adicional.
            <br><br>
            Gracias por hacer parte de nuestros servicios y confiar en nosotros.
            <br><br>
            Cordial Saludo,
            <br><br>
            <strong>3D Mobile 3DM SAS</strong><br>
            <strong>NIT: 900.307.626-4</strong> 
            <br><br>
            <strong>RECIBE EL PREMIO: ${$('#inputName').val()}</strong>
            <br><br>
            <strong>CC #:${$('#inputColID').val()} de ${$('#inputCity').val()}</strong>`)
            $('#declarationForm').modal('show');
            $('#aggrementCheckbox').change(
              function(){
                  if ($(this).is(':checked')) {
                      $('#buttonSubmitDetails').prop('disabled', false);
                  }
                  else{
                    $('#buttonSubmitDetails').prop('disabled', true);
                  }
              });   
            $('#buttonSubmitDetails').on('click',()=>{
              let pdfName=(Math.floor(100000 + Math.random() * 900000)).toString()+'.pdf';
              let htmlStr=getHtmlText($('#inputCoins').val(),$('#inputName').val(),$('#inputColID').val(),$('#inputCity').val(),$('#phone').val(),dateNumber,month,year)
              var iframe=document.createElement('iframe');
              $('body').append($(iframe));
              setTimeout(function(){
                  var iframedoc=iframe.contentDocument||iframe.contentWindow.document;
                  $('body',$(iframedoc)).html(htmlStr);

                  html2canvas(iframedoc.body, {
                    onrendered: function(canvas) {
                      $(iframe).remove()
                      var data = canvas.toDataURL();
                      var docDefinition = {
                          content: [{
                              image: data,
                              width: 1000,
                          }]
                      };
                      let docGenerator=pdfMake.createPdf(docDefinition);
                      docGenerator.getBlob((blob) => {
                        formData.append('pdf', blob, pdfName);
                        $('#aggrementCheckbox').prop('disabled', true);
                        $('#buttonSubmitDetails').html('<div class="spinner-border" style="height:2vw;width:2vw;margin:0 auto;"></div>');    
                        submitDetails(formData); 
                      });
                    }
                  });
              }, 10);

              // var data = new Blob([doc.output()], {
              //   type: 'application/pdf'
              // });  
              
              // html2canvas(document.querySelector("#capture")).then(canvas => {
              //   var doc = new jsPDF("p", "mm", "a4");
              
              //   doc.fromHTML(htmlStr, 15, 15, {
              //     width: 170
              //  }, function() {
              //     doc.save('sample-file.pdf');
              //  });
              // });

              // html2canvas(htmlStr.find('#body'), {
              //   dpi: 300, // Set to 300 DPI
              //   scale: 3, // Adjusts your resolution
              //   onrendered: function(canvas) {
              //     const imgData = canvas.toDataURL('image/png');
              //     const pdf = new jsPDF();
              //     pdf.addImage(imgData, 'PNG', 0, 0, 100, 200);
              //     pdf.save('download.pdf');
              //   }
              // });
              
                  
            }) 
          },800)
  }
  const animateValue=(obj, start, end, duration)=> {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      obj.innerHTML = '<img class="coin-icon" src="/images/coinIcon.png" alt=""/> '+Math.floor(progress * (end - start) + start)+' coins<div class="coin-value">(1 coin= $1000.00 COP)</div>';
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  const resetDeclerationFormState=()=>{
    $('#inputName').val('');
    $('#inputCoins').val('');
    $('#inputColID').val('');
    $('#inputCity').val('');
    $('#buttonSubmitDetails').prop('disabled', true);
    $('#buttonSubmitDetails').html('Next');
    $('#aggrementCheckbox').prop('disabled', false);
    $('#aggrementCheckbox').prop('checked', false);
    $('#declarationForm').modal('hide');
    $('#buttonSubmitDetails').off('click')
  }


  

  const showNextModalAfterDelay=(response, responseCode,transcationID)=>{
    if(response==="SUCCESS"){
      appendTransaction(transcationID);
      setTimeout(()=>{
        $('#successForm').modal('show');
        $('#closeThanksDialog').click(()=>{
          $('#successForm').modal('hide');
        });
        let wallet_bal=$('#wallet_balance').val();
        animateValue(document.getElementById('balance'), parseInt(wallet_bal), parseInt(wallet_bal)-parseInt($('#inputCoins').val()), 1000);
        $('#wallet_balance').val((parseInt(wallet_bal)-parseInt($('#inputCoins').val())).toString())

        resetDeclerationFormState();

      },800);
    }
    else if(response==="ERROR" && responseCode==="INS_AMT"){
      resetDeclerationFormState()
      setTimeout(()=>{
        $('#amountInputModal').modal('show');
        $('#errorMessage').slideDown('Insufficient Amount in your wallet');  
      },800);
    }
    else{
      setTimeout(()=>{
        resetDeclerationFormState()
        $('#amountInputModal').modal('show');
        $('#errorMessage').slideDown('Something Went Wrong');
      },800);
    }
  }


  const submitDetails=(formData)=>{
    $.ajax({
      url: window.location.origin+'/processWithdraw',  
      type: 'POST',
      data:formData,
      success: (data)=>{
           showNextModalAfterDelay(data.status, data.code,data.transactionID)
      },
      cache: false,
      contentType: false,
      processData: false
   });
  }
  

  const appendTransaction=(transactionID)=>{
    $(".trans-list").prepend(
      ' <div class="trans trans-' +'trans-minus' +'">\
      <div class="trans-details">\
      \
      <h3 class="trans-name">retiro '+transactionID+'</h3>\
      <h5 class="trans-type-date" style="font-size:1vw;">\
      <i class="fas fa-history" style="margin-right:0.5vw;"></i>pending -  Just Now</h5>\
      </div>\
      <div class="trans-amt">\
      <h4 class="trans-amt amt-' +
      'blue' +
      '">' +
      
      " <strong>-" +
      $('#inputCoins').val() +" coin(s)"+
      "</strong></h4>\
      </div>\
      </div>"
    );
  }
  

const getHtmlText=(inputCoins, name, colombianID, city, phone, dateNumber, month, year)=>{
    return  `
    <html>
    <head><meta http-equiv=Content-Type content="text/html; charset=UTF-8">
    <style type="text/css">
    <!--
    span.cls_003{font-family:"Century Schoolbook Bold",serif;font-size:12.0px;  line-height: 0.5cm;color:rgb(54,95,145);font-weight:bold;font-style:normal;text-decoration: none}
    div.cls_003{font-family:"Century Schoolbook Bold",serif;font-size:12.0px;color:rgb(54,95,145);font-weight:bold;font-style:normal;text-decoration: none}
    span.cls_004{font-family:"Century Schoolbook Bold",serif;font-size:12.0px;color:rgb(0,175,239);font-weight:bold;font-style:normal;text-decoration: none}
    div.cls_004{font-family:"Century Schoolbook Bold",serif;font-size:12.0px;color:rgb(0,175,239);font-weight:bold;font-style:normal;text-decoration: none}
    span.cls_002{font-family:"Century",serif;font-size:12.0px;color:rgb(54,95,145);font-weight:normal;font-style:normal;text-decoration: none}
    div.cls_002{font-family:"Century",serif;font-size:12.0px;color:rgb(54,95,145);font-weight:normal;font-style:normal;text-decoration: none}
    span.cls_005{font-family:"Century",serif;font-size:12.0px;color:rgb(0,175,239);font-weight:normal;font-style:normal;text-decoration: none}
    div.cls_005{font-family:"Century",serif;font-size:12.0px;color:rgb(0,175,239);font-weight:normal;font-style:normal;text-decoration: none}
    span.cls_007{font-family:"Century",serif;font-size:12.0px;color:rgb(255,0,0);font-weight:normal;font-style:normal;text-decoration: none}
    div.cls_007{font-family:"Century",serif;font-size:12.0px;color:rgb(255,0,0);font-weight:normal;font-style:normal;text-decoration: none}
    -->
    </style>
    <script type="text/javascript" src="a8da7fe4-75b5-11eb-8b25-0cc47a792c0a_id_a8da7fe4-75b5-11eb-8b25-0cc47a792c0a_files/wz_jsgraphics.js"></script>
    </head>
    <body id='body'>
    <div style="position:absolute;margin-left:70px;top:0px;width:650px ;height:850px;border-style:outset;overflow:hidden">
    <div style="position:absolute;left:0px;top:0px">
    <img src="a8da7fe4-75b5-11eb-8b25-0cc47a792c0a_id_a8da7fe4-75b5-11eb-8b25-0cc47a792c0a_files/background1.jpg" width=650 ; height=850></div>
    <div style="position:absolute;left:197.76px;top:84.36px" class="cls_003"><span class="cls_003">REDENCIÓN DE </span><span class="cls_004">${inputCoins} </span><span class="cls_003">MONEDAS VIRTUALES</span></div>
    <div style="position:absolute;left:261.84px;top:96.60px" class="cls_003"><span class="cls_003">ACTA DE ENTREGA</span></div>
    <div style="position:absolute;left:72.00px;top:145.68px" class="cls_003"><span class="cls_003">¡Felicitaciones, eres un ganador!</span></div>
    <div style="position:absolute;left:72.00px;top:170.16px" class="cls_002"><span class="cls_002">Con la presente hacemos constar la entrega de </span><span class="cls_005">${parseInt(inputCoins)*1000}</span><span class="cls_002"> COP (equivalente a </span><span class="cls_004">${inputCoins}</span></div>
    <div style="position:absolute;left:72.01px;top:180.48px" class="cls_002"><span class="cls_002">monedas virtuales redimidas), al ganador(a) </span><span class="cls_005">${name} </span><span class="cls_002">identificado(a) con C.C. No.</span></div>
    <div style="position:absolute;left:72.00px;top:194.76px" class="cls_007"><span class="cls_007">${colombianID}</span><span class="cls_002">, de </span><span class="cls_007">${city}</span><span class="cls_002">, correspondiente a la(s) actividad(es) realizada por Retos</span></div>
    <div style="position:absolute;left:72.00px;top:207.00px" class="cls_002"><span class="cls_002">Gamer. El premio se entregará luego de la verificación de la titularidad realizada por el operador,</span></div>
    <div style="position:absolute;left:72.00px;top:219.24px" class="cls_002"><span class="cls_002">la cual debe coincidir con los datos del ganador.</span></div>
    <div style="position:absolute;left:72.00px;top:243.72px" class="cls_002"><span class="cls_002">Asimismo, el ganador será notificado mediante un mensaje SMS a la línea registrada, después</span></div>
    <div style="position:absolute;left:72.00px;top:256.08px" class="cls_002"><span class="cls_002">de que el proceso haya sido concretado.</span></div>
    <div style="position:absolute;left:72.00px;top:280.56px" class="cls_002"><span class="cls_002">El premio se entregará luego de que el operador realice la correspondiente verificación de la</span></div>
    <div style="position:absolute;left:72.00px;top:292.80px" class="cls_002"><span class="cls_002">titularidad de la línea telefónica y esta sea exitosa.</span></div>
    <div style="position:absolute;left:72.00px;top:341.88px" class="cls_003"><span class="cls_003">LÍNEA GANADORA:</span><span class="cls_002"> </span><span class="cls_005">${phone}</span></div>
    <div style="position:absolute;left:72.00px;top:366.36px" class="cls_002"><span class="cls_002">Adicionalmente, autorizo la publicación de mi nombre y fotografías como testimoniales para Retos Gamer.</span></div>
    <div style="position:absolute;left:72.00px;top:403.20px" class="cls_002"><span class="cls_002">Esta constancia se firma en la ciudad de Bogotá, a los </span><span class="cls_005">${dateNumber} </span><span class="cls_002">días del mes de</span></div>
    <div style="position:absolute;left:72.00px;top:415.44px" class="cls_005"><span class="cls_005">${month}</span><span class="cls_002"> de </span><span class="cls_005">${year}</span><span class="cls_002">. Premio recibido libre de cualquier costo adicional.</span></div>
    <div style="position:absolute;left:72.00px;top:439.92px" class="cls_002"><span class="cls_002">¡Gracias por hacer parte de nuestros servicios y confiar en nosotros!</span></div>
    <div style="position:absolute;left:72.00px;top:464.52px" class="cls_002"><span class="cls_002">Cordial saludo,</span></div>
    <div style="position:absolute;left:72.00px;top:513.48px" class="cls_002"><span class="cls_002">3D Mobile 3DM SAS</span></div>
    <div style="position:absolute;left:72.00px;top:525.72px" class="cls_002"><span class="cls_002">NIT: 900.307.626-4</span></div>
    <div style="position:absolute;left:72.00px;top:599.28px" class="cls_002"><span class="cls_002">RECIBE EL PREMIO: </span><span class="cls_005">${name}</span></div>
    <div style="position:absolute;left:72.00px;top:611.64px" class="cls_002"><span class="cls_002">CC #:</span><span class="cls_007">${colombianID}</span><span class="cls_002">, de </span><span class="cls_007">${city}</span></div>
    </div>
    
    </body> 
    </html>`;
 }















  