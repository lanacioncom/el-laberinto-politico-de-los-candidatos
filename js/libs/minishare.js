var MiniShare;

;(function(global, document, $){

    "use strict";

    MiniShare = global.MiniShare = global.MiniShare || {};

    MiniShare.$twitterButton = $('.minishare-tw');
    MiniShare.$facebookButton = $('.minishare-fb');
    MiniShare.$googleButton = $('.minishare-gp');
    MiniShare.$mailButton = $('.minishare-mail');

    MiniShare.getCurrentLocation = function(){
        return window.location;
    }

    MiniShare.options = {
        fb:{
            title:'Take a look!',
            text:'Take a look in my awesome site!',
            img: ''
        },
        tw:{
            text:'Take a look in my awesome site!',
            related : '',
            ht: '',
            via:''
        },
        em:{
            subject:'Take a look!',
            body:'Take a look in my awesome site!'
        },
        getUrl: MiniShare.getCurrentLocation
    };

    MiniShare.init = function(opts){
        $.extend(MiniShare.options,opts);
        MiniShare.$twitterButton.on('click',MiniShare.shareTwitter);
        MiniShare.$facebookButton.on('click',MiniShare.shareFacebook);
        MiniShare.$googleButton.on('click',MiniShare.shareGoogle);
        MiniShare.$mailButton.on('click',MiniShare.shareMail);
    }

    MiniShare.openWindow = function(url,title){
        var width  = 575,
            height = 400,
            left   = ($(window).width()  - width)  / 2,
            top    = ($(window).height() - height) / 2,
            opts   = 'status=1' +
                     ',width='  + width  +
                     ',height=' + height +
                     ',top='    + top    +
                     ',left='   + left;
        
        window.open(url, title, opts);

        return false;
    }

    MiniShare.shareTwitter = function(e){
        e.preventDefault();
        var qObj = {
            'text': MiniShare.options.tw.text,
            'related': MiniShare.options.tw.related,
            'hashtags': MiniShare.options.tw.ht,
            'url': MiniShare.options.getUrl('twitter'),
            'via': MiniShare.options.tw.via
        };

        var qs = $.param(qObj);

        MiniShare.openWindow("https://twitter.com/intent/tweet?"+qs,'Twitter');

        return false;
    }

    MiniShare.shareFacebook = function(e){
        e.preventDefault();

        var qObj = {
            'u' : MiniShare.options.getUrl('facebook')
        }

        var qs = $.param(qObj);
       
        MiniShare.openWindow("http://www.facebook.com/sharer/sharer.php?"+qs,'Facebook');            

        return false;
    }

    MiniShare.shareGoogle = function(e){
        e.preventDefault();
        var qObj = {
            'url' : MiniShare.options.getUrl('google+')
        }

        var qs = $.param(qObj);

        MiniShare.openWindow("https://plus.google.com/share?"+qs,'Google+');            

        return false;
    }

    MiniShare.shareMail = function(e){

        var qObj = {
            'subject': MiniShare.options.em.subject,
            'body': MiniShare.options.em.body + ' - ' + MiniShare.options.getUrl('email')
        };

        var qs = $.param(qObj).replace(/\+/g,' ');

        var href = "mailto:?" + qs;

        window.location = href;

        return false;
    }


})(window, document,jQuery);