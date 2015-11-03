var PathStatus 	= 0;
var angle 		= Math.PI/((4-1)*2);	
var mainButton 	= [
	{'bg':'../images/bg-2x.png','css':'','cover':'../images/icon-2x.png','html':'<span class="cover"></span>'},
	{'bg':'','css':'','cover':'','html':'','angle':-405,'speed':200}
];
var Radius 		= 100;		//灏忓浘鍑烘潵鐨勫崐寰�
var Offset 		= 40;		//灏忓浘鍑烘潵鍚庣殑鍋忕Щ閲�
var Path 		= 1;		//鍑虹幇鏂瑰紡锛�1锛氬乏涓婏紝2:宸︿笅锛�3锛氬彸涓婏紝4锛氬彸涓�
var OutSpeed 	= 80;		//灏忓浘鍑虹幇鐨勯€熷害
var OutIncr 	= 50;		//灏忓浘鍑烘潵鐨勬棆杞�
var OffsetSpeed = 200;		//灏忓浘鍑烘潵鐨勬棆杞€熷害
var InSpeed 	= 480;		//灏忓浘杩涘幓鐨勯€熷害
var InIncr 		= -80;		//灏忓浘杩涘幓鐨勬棆杞�
function PathRun(){
	
	var PathMenu = $('#PathMenu');
	var PathItems = PathMenu.children('.PathItem').slice(0,4);
	if(PathStatus == 0){
		var Count = PathItems.size();
		PathItems.each(function(SP){
			var ID = $(this).index();
			if (ID == 1) {
				var X 	= Radius;
				var Y 	= 0; 
				var X1 	= X + Offset;
				var Y1 	= Y;
			}else if (ID == Count){
				var X 	= 0;
				var Y 	= Radius;
				var X1 	= X;
				var Y1 	= Y + Offset;				
			}else{
				var X 	= Math.cos(angle * (ID - 1)) * Radius;
				var Y 	= Math.sin(angle * (ID - 1)) * Radius;
				var X1	= X + Offset;
				var Y1 	= Y + Offset;
			}
			
			if(Path==2){
				Y	= -Y;
				Y1	= -Y1;
			}else if(Path==3){
				X	= -X;
				Y	= -Y;
				X1	= -X1;
				Y1	= -Y1;
			}else if(Path==4){
				X	= -X;
				X1	= -X1;
			}

			$(this).children().children().animate({rotate:720},600);
			
			$(this).animate({left:X1,bottom:Y1},OutSpeed+SP*OutIncr,function(){
				$(this).animate({left:X,bottom:Y},OffsetSpeed);
			});	
		});
		
		if(mainButton[1]['angle']){
			$(PathMenu.children('.PathMain').find('.rotate')).animate({rotate:mainButton[1]['angle']},mainButton[1]['speed']);
		} 
		if(mainButton[1]['bg']!='') $(this).children().css('background-image','url('+mainButton[1]['bg']+')')
		if(mainButton[1]['css']!='') $(this).children().css(mainButton[1]['css']);
		if(mainButton[1]['cover']!='') $(this).children().children().css('background-image','url('+mainButton[1]['cover']+')');
		if(mainButton[1]['html']!='') $(this).children().html(mainButton[1]['html']);
		
		PathStatus = 1;
	}else if(PathStatus == 1){
		PathItems.each(function(SP){
			if(parseInt($(this).css('left'))==4){
				X1 = 0;
			}else{
				if(Path <=2){
					X1 = parseInt($(this).css('left')) + Offset;
				}else if(Path >=3){
					X1 = parseInt($(this).css('left')) - Offset;
				}
			}
			
			if(parseInt($(this).css('bottom'))==4){
				Y1 = 0;
			}else{
				if(Path==3 || Path==2){
					Y1 = parseInt($(this).css('bottom')) - Offset;
				}else if(Path ==1 || Path == 4){
					Y1 = parseInt($(this).css('bottom')) + Offset;					
				}
			}
			$(this).children().children().animate({rotate:0},600);
			$(this).animate({left:X1,bottom:Y1},OffsetSpeed,function(){
				$(this).animate({left:5,bottom:5},InSpeed+SP*InIncr);
				
			});
		});
		
		if(mainButton[1]['angle']){
			$(PathMenu.children('.PathMain').find('.rotate')).animate({rotate:0},mainButton[1]['speed']);
		} 		
		
		if(mainButton[0]['bg']!='') $(this).children().css('background-image','url('+mainButton[0]['bg']+')')
		if(mainButton[0]['css']!='') $(this).children().css(mainButton[0]['css']);
		if(mainButton[0]['cover']!='') $(this).children().children().css('background-image','url('+mainButton[0]['cover']+')');
		if(mainButton[0]['html']!='') $(this).children().html(mainButton[0]['html']);					
		PathStatus = 0;
	}
}
