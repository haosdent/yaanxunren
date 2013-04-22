module.exports = (
    function(){
        var http = require('http')
          , helper
          , user;

        helper = {
            error: function(req, res, next){
                var reply = '请直接输入精确的用户名查询，如:吴瀚宇';
                res.reply(reply);
            }
        };

        user = {
            web: function(req, res, next){
                var that = user;
                var name = req.params.name;
                var callback = function(result){
                    var users = result.disp_data;
                    var userStr = that.format(users, '<br>');
                    res.send(userStr);
                };
                user.find(name, callback);
            }
          , wechat: function(req, res, next){
                var that = user;
                var name = req.weixin.Content;
                var callback = function(result){
                    var users = result.disp_data;
                    var userStr = that.format(users, '\n');
                    if(userStr.length > 1000){
                        res.reply([{
                            title: '匹配到[' + name + ']的结果共有' + result.dispNum + '个'
                          , picurl: 'http://yaanxunren.cloudfoundry.com/images/yaancomeon.jpg'
                          , url: 'http://yaanxunren.cloudfoundry.com/web/' + encodeURIComponent(name)}]);
                    }else{
                        res.reply(userStr);
                    };
                };
                user.find(name, callback);
            }
          , find: function(name, fn){
                var url = 'http://opendata.baidu.com/api.php?resource_id=6109&format=json&ie=utf-8&oe=utf-8&query=' + name + '&from_mid=1';
                http.get(url, function(clientRes){
                    var body = '';
                    clientRes.on('data', function(chunk){
                        body += chunk;
                    }).on('end', function(){
                        body = JSON.parse(body);
                        var data = body.data[0];
                        fn(data);
                    });
                });
            }
          , format: function(users, wrap){
                var userStr = '';
                for(var i = 0, l = users.length; i < l; i++){
                    var user = users[i];
                    if(user.found === '0'){
                        user.found = '未找到';
                    }else{
                        user.found = '已经找到';
                    };
                    userStr += '[姓名]:' + user['name'] + ', ' + user['found'] + wrap;
                    userStr += '[信息来源]:' + user['url'] + wrap;
                    userStr += '[年龄性别]:' + user['age'] + ', ' + user['sex'] + wrap;
                    userStr += '[描述]:' + user['desc'] + wrap;
                    userStr += '[联系人]:' + user['remarks'] + ', ' + user['phone'] + wrap;
                    if(i < l - 1){
                        userStr += '------------' + wrap;
                    };
                };
                if(users.length === 0){
                    userStr = '暂时未查询到相关信息. 此工具使用方法, 直接输入精确的用户名查询，如:吴瀚宇';
                };
                return userStr;
            }
        }

        return {
            helper: helper
          , user: user
        };
    }
).call(this);