var Botapp = angular.module('BotApp', ["ngSanitize", "ui.bootstrap", "angular-smilies"]);
if (!String.prototype.includes) {
    String.prototype.includes = function (search, start) {
        if (typeof start !== 'number') {
            start = 0;
        }

        if (start + search.length > this.length) {
            return false;
        } else {
            return this.indexOf(search, start) !== -1;
        }
    };
}
Botapp.controller("ChatCtrl", function ($scope) {
    var side = 'right';
    $scope.messages = []; $scope.options = []; $scope.time = ""; $scope.selectedFile = []; $scope.herocards = [];
    //var url = "http://localhost:18602/api/MicrosoftBotFramework/TalkToBot";
    var url = "http://nitro.ey.net/EYBot/api/MicrosoftBotFramework/TalkToBot";

    //To generate random unique key for user id
    $scope.generateRowKey = function () {
        var previous = 0;
        var date = Date.now();
        if (date <= previous) {
            date = ++previous;
        }
        else {
            previous = date;
        }
        return String(date);
    };

    $scope.userid = "EYBot" + $scope.generateRowKey();

    $scope.keys = {
        CoversationId: '',
        Message: ' ',
        Watermark: '',
        User: $scope.userid,
        EYBotId: ''
    };

    // Occurs when we receive chat messages
    var avatar = "../images/user.jpg"
    $scope.sendChatMessage = function (message, side, options, msgtype, imageurl, herocards) {
        $(".message-loading").hide(); message = message.replace("<br />", "");
        if (message != "" && message != null) {
            $scope.getcurrrenttime();
            console.log(message);
            $scope.messages.push({
                avatar: avatar,
                text: message,
                side: side,
                options: options,
                herocards: herocards,
                time: $scope.time,
                msgtype: msgtype,
                imageurl: imageurl,
            });
            $scope.options = options;
            $scope.herocard = herocards;
            $scope.$apply();
            $('#chatmessages').animate({ scrollTop: $('#chatmessages')[0].scrollHeight }, 100);
        }
    };

    // On chat messages send button click 
    $scope.sendMessage = function (message) {
        if (message != "" && message != null) {
            $scope.sendChatMessage(message, 'right', "", "message");
            $scope.keys.Message = message;
            $scope.postmessagetoApi();
            $scope.messageText = "";
        }
    };
    // On chat attachment messages send button click 
    $scope.sendMessageOption = function (message, value) {
        if (message != "" && message != null) {
            $scope.sendChatMessage(message, 'right', "", "message");
            $scope.keys.Message = value;
            $scope.postmessagetoApi();
            $scope.messageText = "";
        }
    };

    // To post the message to the APi
    $scope.postmessagetoApi = function () {
        $(".message-loading").show();
        var optionitems = []; $scope.herocards = []; $scope.options = [];
        console.log(JSON.stringify($scope.keys));
        $.ajax({
            url: url,
            data: $scope.keys,
            method: 'post',
            dataType: 'json',
            success: function (data) {
                $scope.keys.CoversationId = data.CoversationId;
                $scope.keys.Watermark = data.Watermark;
                $scope.keys.Message = data.ChatResponse;
                var responses = "";
                if (data.ChatResponse != null) {
                    if (data.ChatResponse.indexOf("Options:") != -1) {
                        var responseoption = data.ChatResponse.split("Options:");
                        responses = responseoption[0].replace("\n\n", "<br />").split("\n\n\n*");
                        responseoption = responseoption[1].split("\n* ");
                        for (var i = 0; i < responseoption.length; i++) {
                            responseoption[i] = responseoption[i].replace(/[*]/gi, '');
                            if (responseoption[i] != "") {
                                optionitems.push(responseoption[i]);
                            }
                        }
                    }
                    else {
                        responses = data.ChatResponse.replace("\n\n", "<br />").split("\n\n\n*");
                    }
                }
                else if (data.ChatResponse == null && data.attachment != null) {
                    text = data.attachment.content.text == undefined ? "" : data.attachment.content.text;
                    $scope.renderattachment(text, data.attachment);
                }
               
                for (var i = 0; i < responses.length; i++) {
                    var text = responses[i];
                    //excluded below for markdown
                    if (!text.includes('[![')) {
                        if (text.indexOf('src=') <= -1) {
                            text = $scope.urlify(text);
                        }
                    }
                    side = 'left';
                    if (i == responses.length - 1) {
                        if (data.attachment != null) {
                            if (data.attachment.content.text == undefined) {
                                $scope.renderattachment(text, data.attachment);
                            }
                            else {
                                text = data.attachment.content.text == undefined ? "" : data.attachment.content.text
                                if (text != "" && responses.length == 1) {
                                    $scope.sendChatMessage(responses[i], side, optionitems, "message", '', '');
                                }
                                $scope.renderattachment(text, data.attachment);
                            }
                        }
                        else {
                            $scope.sendChatMessage(text, side, optionitems, "message", '', '');

                        }
                    }
                    else {

                        $scope.sendChatMessage(text, side, optionitems, "message", '', '');
                    }
                }
            },
            error: function (data) {
                console.log(data);
                text = "Something went wrong.Please try after some time";
                $scope.sendChatMessage(text, side, options, "message", '', '');

            }
        });
    };
    //To render attachment response
    $scope.renderattachment = function (text, attachment) {


        switch (attachment.contentType) {
            case "application/vnd.microsoft.card.hero":
                $scope.renderHerocard(text, attachment);
                break;

            case "image/png": case "image/jpg": case "image/jpeg": case "image/gif":
                $scope.renderimage(text, attachment.contentUrl);
                break;
            case "application/vnd.microsoft.card.thumbnail":
                break;
            case "application/vnd.microsoft.card.video":

            case "application/vnd.microsoft.card.animation":
                break;
            case "application/vnd.microsoft.card.audio":
                break;
            case "application/vnd.microsoft.card.signin":
                break;
            case "application/vnd.microsoft.card.receipt":
                break;
            case "application/vnd.microsoft.card.adaptive":
                break;
            case "application/vnd.microsoft.card.flex":
                break;
            case "audio/mpeg": case "audio/mp4":
                break;
            case "video/mp4":
        }

    };
    $scope.renderHerocard = function (text, attachment) {
        $scope.herocards = [];

        for (var j = 0 ; j < attachment.content.buttons.length; j++) {
            $scope.herocards.push(attachment.content.buttons[j]);
        }
        $scope.sendChatMessage(text, side, '', "message", '', $scope.herocards);
    };
    $scope.renderimage = function (text, imageurl) {

    };

    //To get current time
    $scope.getcurrrenttime = function () {
        var date = new Date();
        var hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
        var am_pm = date.getHours() >= 12 ? "PM" : "AM";
        hours = hours < 10 ? "" + hours : hours;
        var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
        $scope.time = hours + ":" + minutes + " " + am_pm;
        return $scope.time;
    };

    //To Make clickable url
    $scope.urlify = function (text) {

        var urlRegex = /(http(s)?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, function (url) {
            return '<a href="' + url + '"  target="_blank">' + url + '</a>';
        })
    };

    $scope.openchatbox = function (EYBotId) {
        $("#homechat-window").fadeIn(800);
        $("#page-shadow").show();
        $scope.keys.EYBotId = EYBotId;
    };
    $scope.chatwindowclose = function () {
        $("#homechat-window").fadeOut(800)
        $("#page-shadow").hide();
    };
    $scope.setSelectedFile = function (event) {
        var files = event.target.files; //FileList object
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.onload = $scope.imageIsLoaded;
            reader.readAsDataURL(file);
        }
    }

    $scope.imageIsLoaded = function (e) {
        $scope.$apply(function () {
            $scope.sendChatMessage("image", "right", "", "image", e.target.result);
        });
    }
});

Botapp.directive('markdown', function ($window) {
    var converter = new $window.Showdown.converter();
    return {
        restrict: 'E',
        link: function (scope, element, attrs) {
            console.log('received');
            console.log(attrs.marktext);
            var htmlText = converter.makeHtml(attrs.marktext);
            console.log('converted');
            console.log(htmlText);
            element.html(htmlText);
        }
    }
});

