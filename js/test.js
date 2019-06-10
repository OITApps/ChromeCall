/*
ccAlert('786 879 0802 has been disabled.', 'Would you like Chrome Call to keep this number disabled?',

    {
        text: 'Disable just once',
        click: function(){
            alert('Disable just once button Selected');
        },
        mouseover: function(){
            console.log('Disable just once button Mousedover');
        }
    },{
        text: 'Disable just once',
        click: function(){
            setDialogText('Hola', 'Señor', fadeIn = true, fadeOut = true);

        },
        mouseover: function(){
            console.log('Disable just once button Mousedover');
        },
        mouseout: function(){
            console.log('Disable just once button Mousedout');
        },
        noHide: true,
    }, {
        type: 'checkbox',
        text: 'remember my answer',
        click: function(){
            alert('checkbox clicked');
        },
        mouseover: function(){
            console.log('checkbox mousedover');
        }
    });
ccAlert("Second Message", 'This message Waited for the first message to finish.');
ccAlert("Third Message", 'This message Waited for the second message to finish.');

*/
let curDate = new Date();
let startDate = curDate.getFullYear() + '-' + curDate.getMonth() + '-' + curDate.getDay();
let prevDate = new Date();
prevDate.setDate(prevDate.getDate() + -30).toString();
let endDate = prevDate.getFullYear() + '-' + prevDate.getMonth() + '-' + prevDate.getDay();
console.log(startDate);
console.log(endDate);
