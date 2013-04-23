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
                            title: '匹配到[' + name + ']的结果共有' + users.length + '个'
                          , picurl: 'http://yaanxunren.cloudfoundry.com/images/yaancomeon.jpg'
                          , url: 'http://yaanxunren.cloudfoundry.com/web/' + encodeURIComponent(name)}]);
                    }else{
                        res.reply(userStr);
                    };
                };
                user.find(name, callback);
            }
          , filter: function(users){
                var userMap = {};
                users.map(function(user){
                    if(userMap[user.name + 'connect' + user.phone] === undefined){
                        userMap[user.name + 'connect' + user.phone] = user;
                    }else{
                        var tempUser = userMap[user.name + 'connect' + user.phone];
                        if(tempUser.found !== '1'){
                            if(user.found === '1' || JSON.parse(user.input_time) > JSON.parse(tempUser.input_time)){
                                userMap[user.name + 'connect' + user.phone] = user;
                            };
                        };
                    };
                });
                var newUsers = [];
                for(var k in userMap){
                    newUsers.push(userMap[k]);
                };
                return newUsers;
            }
          , find: function(name, fn){
                var that = user;
                var url = 'http://opendata.baidu.com/api.php?resource_id=6109&format=json&ie=utf-8&oe=utf-8&query=' + name + '&from_mid=1';
                http.get(url, function(clientRes){
                    var body = '';
                    clientRes.on('data', function(chunk){
                        body += chunk;
                    }).on('end', function(){
                        body = JSON.parse(body);
                        var data = body.data[0];
                        data.disp_data = that.filter(data.disp_data);
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
                    userStr += '[来源]:' + user['url'] + wrap;
                    userStr += '[年龄性别]:' + user['age'] + ', ' + user['sex'] + wrap;
                    userStr += '[描述]:' + user['desc'] + wrap;
                    userStr += '[联系人]:' + user['remarks'] + ', ' + user['phone'] + wrap;
                    if(i < l - 1){
                        userStr += '------------' + wrap;
                    };
                };
                if(users.length === 0){
                    userStr = '暂时未查询到相关信息，请直接到名大寻人平台发布寻人信息。此工具使用方法, 直接输入精确的用户名查询，如:吴瀚宇';
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