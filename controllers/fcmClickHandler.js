//jshint esversion:6


exports.challengeClicked=(req,res)=>{
    const id= req.query.chid;
    res.cookie('challengeIdChallengeClicked', id, {httpOnly: true, overwrite: true});
    res.redirect('/challenge');  
}
exports.leaderboardClicked=(req,res)=>{
    const id= req.query.chid;
    res.cookie("leaderBoardChallengeClickedID", id,{ httpOnly: true, secure: false, overwrite: true});
    res.redirect('/leaderBoardChallenge');
}