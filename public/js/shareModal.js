$("#btn-share").click(function() {
	var shareHtml = "",
		el = $(this),
		shareModalTitle = el.data("modal-title"),
		shareModalDescription = el.data("modal-description"),
		shareFacebookLabel = el.data("facebook-label"),
		shareTwitterLabel = el.data("twitter-label"),
		shareTwitterText = el.data("twitter-text"),
		shareLinkedInLabel = el.data("linkedin-label"),
		shareLinkedInTitle = encodeURIComponent(el.data("linkedin-title")),
		shareLinkedInSummary = encodeURIComponent(el.data("linkedin-summary")),
		shareLinkedInSource = window.location.protocol + "//" + window.location.hostname,
		shareEmailLabel = el.data("email-label"),
		shareEmailSubject = el.data("email-subject");
        var challengeID=document.getElementById('challengeID').value;
        shareUrl = window.location.origin+'/challenge?id='+challengeID

	shareHtml += '<div class="modal fade in text-center" id="modal-share" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="false">'+
	'<div class="modal-dialog">'+
		'<div class="modal-content" style="background: rgba(20,20, 20, 0.6); backdrop-filter: blur(4px);text-align: center;border-radius: 0.5vw;>'+
			'<div class="modal-header">'+
				'<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>'+
				'';
	
				if (shareModalDescription != undefined) {
					shareHtml += '<p>'+shareModalDescription+'</p>';
				}
	
			'</div>'+
			'<div class="modal-body">'+
				'<ul class="list-unstyled">';
	
					if (shareFacebookLabel != undefined) {
						shareHtml += '
					if (shareTwitterLabel != undefined) {
						shareHtml += '<li><a href="https://twitter.com/intent/tweet?text='+shareTwitterText+'&url='+shareUrl+'" title="'+shareTwitterLabel+'" target="_blank" class="btn btn-twitter"><i class="icon-twitter"></i> '+shareTwitterLabel+'</a></li>';
					}
					if (shareLinkedInLabel != undefined) {
						shareHtml += '<li><a href="https://www.linkedin.com/shareArticle?mini=true&url='+shareUrl+'&title='+shareLinkedInTitle+'&summary='+shareLinkedInSummary+'&source='+shareLinkedInSource+'" title="'+shareLinkedInLabel+'" target="_blank" class="btn btn-linkedin"><i class="icon-linkedin"></i> '+shareLinkedInLabel+'</a></li>';
					}
					if (shareEmailLabel != undefined) {
						shareHtml += '<li><a href="mailto:?subject='+shareEmailSubject+'" title="'+shareEmailLabel+'" class="btn btn-email"><i class="icon-mail"></i> '+shareEmailLabel+'</a></li>';
					}
	
				'</ul>'+
			'</div>'+
		'</div>'+
	'</div>'+
'</div>';
	
	$("body").append(shareHtml);
	
	$('#modal-share').modal()
});