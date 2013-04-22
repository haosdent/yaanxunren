module.exports = (
    function(){
        var controllers = require('./controllers');

        var route = {
            '-1': controllers.helper.error
          , '0': controllers.user.wechat
        };

        return function(req, res, next){
            var index;
            var msg = req.weixin;
            if(msg.MsgType !== 'text') index = -1;
            var content = msg.Content;
            if(content === undefined) index = -1;

            if(index != -1) index = 0;

            try{
                route[index](req, res, next);
            }catch(err){
                route['-1'](req, res, next);
            };
        };
    }
).call(this);