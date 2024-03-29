function diytplController($scope, $http, $location) {  
	$scope.$parent.showbox = "diy";
	$scope.$parent.menu = [];
	$_GET = $location.search();
    
	$(".made_style").on("click",".made_style li a",function(){
		$("ul.made_style li").addClass("cu")
		$(this).parents("ul.made_style li").siblings().removeClass("cu").find("a,.made_name").removeClass("cu")
	});
    $(".made_style").on('click','ul.made_style li.home_a .list_box a',function(){
		$(this).addClass("cu").siblings().removeClass("cu")
		$(this).parent().parent().addClass("cu").siblings().removeClass("cu")
	});
	$("ul.made_style li.foot_a a").on('click',function(){
		$(this).addClass("cu").parent().siblings().find("a").removeClass("cu")
	});
	//获取页面列表
	var type = $_GET['type'];
	$http.get('../template-filelist').success(function(json){
		var homelist ='';
		var tit = '';
		var fn = '';
		checkJSON(json, function(json){
			if(type == 1){
				var data_byTitle = [], data_byFilename = [], result = [];
				$.each(json.data.files,function(k,v){
					if (typeof data_byTitle[v.title] === 'undefined') data_byTitle[v.title] = [];
					data_byTitle[v.title].push(v);
					var filename = v.filename.substr(0, v.filename.lastIndexOf('.'));
					if (typeof data_byFilename[filename] === 'undefined') data_byFilename[filename] = [];
					data_byFilename[filename].push(v);
				});
				//根据名称删除重复文件
				for (i in data_byTitle){
					if (data_byTitle[i].length > 1) {
						$.each(data_byTitle[i],function(k,v){
							delete data_byFilename[v.filename.substr(0, v.filename.lastIndexOf('.'))];
						});
						result.push({
							title: i,
							type: data_byTitle[i].length == 2 ? 2 : 1, 
							data: data_byTitle[i]
						});
					}
				}
				for (i in data_byFilename){
					result.push({
						title: data_byFilename[i][0].title,
						type: data_byFilename[i].length == 2 ? 2 : 1,
						data: data_byFilename[i]
					});
				}
				$.each(result,function(k,v){
					var list = '';
					$.each(v.data,function(i,j){
						list += '<dd class="made_name"><a href="javascript:void(0);">'+(v.type == 1?'':'一')+j.title+'（'+j.filename+'）</a></dd>';
					});
					homelist += '<li class="list_a"><dl class="'+(v.type == 1?'made_left':'text_box')+'">'+v.title+'：</dl>'+(v.type == 1?'':'<dl class="wid_box"></dl>')+'<dl class="made_right">'+list+'</dl></li>'
				});
				$('.made_style').html(homelist);

				//右侧预览页
				var file_name,file_tit;
				$('.made_right .made_name').on('click',function(){
					file_name = $(this).text().substring($(this).text().indexOf('（')+1,$(this).text().indexOf('）'));
					file_tit = $(this).text().substring(0,$(this).text().indexOf('（'));
					files = $(this).parents('.list_a').find('dl:first').text().substring(0,$(this).parents('.list_a').find('dl:first').text().indexOf('：'));
					$.each(json.data.files,function(k,v){
						$('.made_style_edite_top .made_edite').text(''+v.content+'');
					});
					var preview = '<h1 class="made_style_edite_top"><a href="javascript:void(0);" class="made_btn resh_btn">保存文件</a><a href="../homepage-preview" class="made_btn Preview_btn">预览首页</a><a onclick="javascript:history.go(-1);" class="made_btn resh_btn" style="cursor: pointer;">返回</a>'+files+'：'+file_tit+'（'+file_name+'）</h1>\n\
                            <textarea class="made_edite">厦门易尔通厦门易</textarea>';
                	$('.made_style_edite').html(preview);

                	$http.get('../template-fileget?type='+type+'&filename='+file_name+'').success(function(json){
						checkJSON(json, function(json){
							$('.made_style_edite .made_edite').html(json.data.code);
						});
					});

                	$('.made_style_edite_top .resh_btn').on('click',function(){
						$http.post('../template-fileedit',{type:type,filename:file_name,code:$('.made_style_edite .made_edite').val()}).success(function(json){
							checkJSON(json, function(json){
								var hint_box = new Hint_box();
                    			hint_box;
							});
						});
					});
				});
			var paddinHeight = $('.made_style_edite').outerHeight() - $('.made_style_edite').height();
			$('.made_style_edite').css('height', $('#home-diy').innerHeight() - paddinHeight);
			}//判断为PC模板
		});//checkJSON结束
	});//GET请求结束
}