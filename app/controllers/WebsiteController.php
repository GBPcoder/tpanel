<?php

class WebsiteController extends BaseController{
    /*
	|--------------------------------------------------------------------------
	| 模版控制器
	|--------------------------------------------------------------------------
	|方法：
    |templatesPC        PC模版查询、增加、设为默认、删除
    |templatesQuery      查询模版
    |templatesList      列出当前已选的模版 
    |copy               拷贝公共模版到用户目录用于定制
    |fileList           列出当前定制模版的可编辑文件
    |fileget            获取文件的内容
    |fileeidt           编辑保存文件
    |rcopy              拷贝一个目录
    |saveTemplate       模板入库
    |unpack             解包模板文件
    |
	*/

    public function templatesList($type=1,$per_page=8,$form=0,$search=NULL,$classify='',$color = NULL){
        $cus_id = Auth::id();
        $without_tid=Template::where('cus_id',$cus_id)->lists('former_id');
        $where = " WHERE type=$type AND cus_id!=$cus_id";
        if(count($without_tid)){
            $notin = implode(",", $without_tid);
            $where .= " AND id NOT IN($notin)";
        }
        if($search){
            $where .= " AND name like '%$search%'";
        }
        if($classify){
            $where .= " AND classify='$classify'";
        }
        $join = '';
        $prefix = Config::get('database.connections.mysql.prefix');
        if($color){
            $join = ' LEFT JOIN '.$prefix.'template_to_color t_r ON t.id=t_r.template_id LEFT JOIN '.$prefix.'color c ON t_r.color_id=c.id';
            if(is_array($color)){
                $in = implode("','", $color);
                $where .= " AND color IN('$in')";
            }
            else{
                $where .= " AND color='$color'";
            }
        }
        $website_info = WebsiteInfo::where('cus_id',$cus_id)->first();
        $total = DB::select('SELECT count(*) FROM '.$prefix.'template t'.$join.$where.' GROUP BY name');
        $result['total'] = count($total);
        $data = DB::select('SELECT t.id as tid,name,tpl_name,created_at,updated_at  FROM '.$prefix.'template t'.$join.$where.' GROUP BY name ORDER BY tid limit '.$form.','.$per_page);
        $result['per_page'] = count($data);
        $result['current_page'] = $form+1;
        $result['last_page'] = ceil($result['total']/$per_page);
        $result['from'] = $form ? $form :1;
        $result['to'] = $form + $result['per_page'];
        $TemplateToColor = new TemplateToColor;
        foreach($data as $k => $v){
            $std['id'] = $v->tid;
            $std['serial'] = $v->name;
            $std['name'] = $v->tpl_name;
            $std['img'] = asset('templates/'.$v->name.'/screenshot.jpg');
            $std['colors'] = $TemplateToColor->getColorByTemplateId($v->tid);          
            if($type==1){             
                if($v->tid==$website_info->pc_tpl_id){
                    $std['is_selected'] = 1;
                    $std['selected_style'] = Color::where('id',$website_info->pc_color_id)->pluck('color');
                }
                else{
                    $std['is_selected'] = 0;
                    $std['selected_style'] = NULL;    
                }
            }
            if($type==2){
                if($v->tid==$website_info->mobile_tpl_id){
                    $std['is_selected'] = 1;
                    $std['selected_style'] = Color::where('id',$website_info->mobile_color_id)->pluck('color');
                }
                else{
                    $std['is_selected'] = 0;
                    $std['selected_style'] = NULL;
                }
            }
            $std['created_at'] = $v->created_at;
            $std['updated_at'] = $v->updated_at;
            $result['data'][$k] = $std;
        }
        return $result;
        //return Response::json(['err'=>0,'msg'=>'','data'=>$result]);
    }

    public function templatesListGet(){
        $type = Input::get('type');
        $per_page = Input::get('per_page') ? Input::get('per_page') : 8;
        $form = Input::get('current_page') ? (Input::get('current_page')-1) * $per_page : 0;
        $search = Input::get('search');
        $classify = Input::get('classify');
        $color = Input::get('color');
        $result = $this->templatesList($type,$per_page,$form,$search,$classify,$color);
        return Response::json(['err'=>0,'msg'=>'','data'=>$result]);
    }

    public function myTemplateList(){
        $cus_id = Auth::id();
        $type = Input::has('type')?Input::get('type'):1;
        //$type = 2;
        $per_page = Input::has('per_page') ? Input::get('per_page') : 8;
        $form = Input::has('current_page') ? (Input::get('current_page')-1) * $per_page : 0;
        $data = Template::where('cus_id',$cus_id)->where('type',$type)
        ->LeftJoin('template_to_color','template.id','=','template_to_color.template_id')
        ->LeftJoin('color','template_to_color.color_id','=','color_id')->select('template.id as tid','name','tpl_name','created_at','updated_at')->groupBy('name')->get()->toArray();
        $i = 1;
        $website_info = WebsiteInfo::where('cus_id',$cus_id)->first();
        $mytemplelist=array();
        $result=array();
        foreach($data as $d){ 
            $mytemplelist[$i]['id'] = $d['tid'];
            $mytemplelist[$i]['serial'] = $d['name'];
            $mytemplelist[$i]['name'] = $d['tpl_name'];
            $mytemplelist[$i]['img'] = asset('templates/'.$d['name'].'/screenshot.jpg');
            if($type==1){
                if($d['tid']==$website_info->pc_tpl_id){
                    $mytemplelist[$i]['is_selected'] = 1;
                }
                else{
                    $mytemplelist[$i]['is_selected'] = 0;  
                }
            }
            if($type==2){
                if($d['tid']==$website_info->mobile_tpl_id){
                    $mytemplelist[$i]['is_selected'] = 1;
                }
                else{
                    $mytemplelist[$i]['is_selected'] = 0;
                }
            }
            $mytemplelist[$i]['created_at'] = $d['created_at'];
            $mytemplelist[$i]['updated_at'] = $d['updated_at'];
            $i++;
        }
        $result = $this->templatesList($type,$per_page,$form);
        return Response::json(['err'=>0,'msg'=>'','data'=>['mytemplelist'=>$mytemplelist,'templelist'=>$result]]);
    }

    public function templateChage(){
        $cus_id=Auth::id();
        $type = Input::get('type');
        $id =  Input::get('id');
        $color = Input::get('color');
        $color_id = Color::where('color_en',$color)->pluck('id');
        $template = Template::find($id);
        if($template->type==$type){
            if($type==1){
                $update = ['pc_tpl_id' => $id,'pc_color_id' => $color_id];
            }
            else{
                $update = ['mobile_tpl_id' => $id,'mobile_color_id' => $color_id];
            }
            $update_result = WebsiteInfo::where('cus_id',$cus_id)->update($update);
            if($update_result){
                Articles::where('cus_id',$cus_id)->where('pushed',0)->update(array('pushed'=>1));
                Classify::where('cus_id',$cus_id)->where('pushed',0)->update(array('pushed'=>1));
                $result = ['err' => 0, 'msg' => ''];
            }
            else{
                $result = ['err' => 1001, 'msg' => '更换模版失败'];
            }
        }
        else{
            $result = ['err' => 1001, 'msg' => '选择模版存在问题'];
        }
        return Response::json($result);
    }
    
    //删除模板
    public function templateDelete(){
        $cus_id = Auth::id();
        $id = Input::get('id');
        $type = Input::get('type');
        $former_id = Template::where('cus_id',$cus_id)->where('id',$id)->where('type',$type)->pluck('former_id');
        $tpl_dir = Template::where('cus_id',$cus_id)->where('id',$id)->where('type',$type)->pluck('name');
        $del_result = Template::where('cus_id',$cus_id)->where('id',$id)->where('type',$type)->delete();
        if($del_result){
           @$this->_remove_Dir(public_path("templates/$tpl_dir"));
           @$this->_remove_Dir(app_path("views/templates/$tpl_dir"));
            $color_list = TemplateToColor::where('template_id',$former_id)->lists('color_id');
            if($type==1){
                $update = ['pc_tpl_id' => $former_id,'pc_color_id' => $color_list[0]];
            }else{
                $update = ['mobile_tpl_id' => $former_id,'mobile_color_id' => $color_list[0]];
            }
            $update_result = WebsiteInfo::where('cus_id',$cus_id)->update($update);
            if($update_result){
                $result = ['err' => 0, 'msg' => ''];
            }else{
                $result = ['err' => 1001, 'msg' => '恢复原模板失败,需重新选择模板'];
            }
        }else{
            $result = ['err' => 1001, 'msg' => '删除模板失败'];
        }
        return Response::json($result);
    }
    
    public function copy(){
        $cus_id = Auth::id();
        $type = Input::get('tpye');
        $type = 1;
        $id = WebsiteInfo::where('cus_id',$cus_id)->pluck('pc_tpl_id');
        $had_name = WebsiteInfo::leftJoin('template','pc_tpl_id','=','template.id')->where('template.cus_id',$cus_id)->pluck('name');
        if($had_name){
            return Response::json(['err' => 0, 'msg' => '']);
        }
        else{
            $count = Template::where('type',$type)->where('cus_id',$cus_id)->count();
            if($count>=3){
                return Response::json(['err' => 1001, 'msg' => '定制模版超过3个']);
            }
            else{
                $tpl_info = Template::where('type',$type)->where('id',$id)->where('cus_id',0)->first();
                $name=$tpl_info->name;
                $new_name = $name.'_'.$cus_id;
                $template = new Template;
                $template->name = $new_name;
                $template->tpl_num=0;
                $template->tpl_name=$tpl_info->tpl_name;
                $template->type = $type;
                $template->cus_id = $cus_id;
                $template->former_id = $id;
                $template->save();
                $insertedId = $template->id;
                $src = app_path('views/templates/'.$name);
                $dst = app_path('views/templates/'.$new_name);
                $src_public = public_path('templates/'.$name);
                $dst_public = public_path('templates/'.$new_name);
                $this->rcopy($src,$dst);
                $this->rcopy($src_public,$dst_public);
                //$img_src = public_path('admin/images/templates/'.$name.'.jpg');
                //$img_dst = public_path('admin/images/templates/'.$new_name.'.jpg');
                //$this->rcopy($img_src,$img_dst);
                $tpl = $type==1 ? 'pc_tpl_id' : 'mobile_tpl_id';
                $update[$tpl] = $insertedId;
                $update = WebsiteInfo::where('cus_id',$cus_id)->update($update);
                return Response::json(['err' => 0, 'msg' => '']);
            }
        }
    }

    public function fileList(){
        $id = Auth::id();
        $name = WebsiteInfo::leftJoin('template','pc_tpl_id','=','template.id')->where('website_info.cus_id',$id)->pluck('name');
        $dst = app_path('views/templates/'.$name);
        $dst_css = public_path('templates/'.$name.'/css');
        $dst_js = public_path('templates/'.$name.'/js');
        $dst_json = public_path('templates/'.$name.'/json');
        $css = $this->getFile($dst_css);
        $tpl = $this->getFile($dst);
        $js = $this->getFile($dst_js);
        $json = $this->getFile($dst_json);
        $files = array_merge($css,$tpl,$js,$json);
        //print_r($files);exit;
        foreach($files as $k => $f){
            $file_type = explode('.', $f);
            switch (end($file_type)) {
                case 'html':$sub = '文件';break;
                case 'js':$sub = '脚本';break;
                case 'css':$sub = '样式';break;
                case 'json':$sub = '数据';break;
                default:
                    $sub = '';
            }      
            $filelist[$k]['title'] = Config::get('file.'.$file_type[0],'其他').$sub;
            $filelist[$k]['filename'] = $f;
        }
        $result = ['name'=>$name,'files'=>$filelist];
        //dd($result);
        return Response::json(['err'=>0,'msg' => '','data' => $result]);
    }

    public function fileget(){
        $id = Auth::id();
        $filename = Input::get('filename');
        $file_type = explode('.', $filename);
        $file_type=end($file_type);
        $name = WebsiteInfo::leftJoin('template','pc_tpl_id','=','template.id')->where('website_info.cus_id',$id)->pluck('name');
        if($file_type=='css'){
            $dst = public_path('templates/'.$name.'/css/'.$filename);
        }
        elseif($file_type=='js'){
            $dst = public_path('templates/'.$name.'/js/'.$filename);
        }
        elseif($file_type=='json'){
            $dst = public_path('templates/'.$name.'/json/'.$filename);
        }
        elseif($file_type=='html'){
            $dst = app_path('views/templates/'.$name.'/'.$filename);
        }
        $content = htmlentities(file_get_contents($dst));
        $result = ['filename' => $content, 'code' => $content];
        return Response::json(['err'=>0,'msg' => '','data' => $result]);
    }

    public function fileedit(){
        $cus_id = Auth::id();
        $filename = Input::get('filename');
        $content = Input::get('code');
        if($filename===NULL || $content===NULL){
            $result = ['err' => 1001, 'msg' => '提交数据错误'];
        }
        else{
            $file_type = explode('.', $filename);
            $file_type=end($file_type);
            $template = WebsiteInfo::join('template','pc_tpl_id','=','template.id')->where('website_info.cus_id',$cus_id)->pluck('name');
            if($file_type=='css'){
               $dst = public_path('templates/'.$template.'/css/'.$filename);
            }
            elseif($file_type=='js'){
                $dst = public_path('templates/'.$template.'/js/'.$filename);
            }
            elseif($file_type=='json'){
                $dst = public_path('templates/'.$template.'/json/'.$filename);
            }
            else{
                if($file_type=='html'){
                    $dst = app_path('views/templates/'.$template.'/'.$filename);
                }
            }
            if(file_exists($dst)){
                $edit = file_put_contents($dst, $content);
                if($edit==FALSE){
                    $result = ['err' => 1001, 'msg' => '无法编辑文件'];
                }
                else{
                    $result = ['err' => 0, 'msg' => ''];
                }
            }
            else{
                $result = ['err' => 1001, 'msg' => '文件不存在'];
            }
        }
        return Response::json($result);
    }
    
    /*
    *删除文件目录及其目录内的文件 
    */
    public function _remove_Dir($dirName){
       if(!is_dir($dirName)) {
           return false;
       }
       $handle = @opendir($dirName);
       while(($file = @readdir($handle)) !== false){
           if($file != '.' && $file != '..'){
               $dir = $dirName . '/' . $file;
               is_dir($dir) ? $this->_remove_Dir($dir) : @unlink($dir);
           }
       }
       closedir($handle);
       return rmdir($dirName) ;
    }
    
    // 拷贝文件和非空目录
    public function rcopy($src, $dst) {
        if (is_dir($src)) {
            if (!file_exists($dst)){
                mkdir($dst);
            }
            $files = scandir($src);
            foreach ($files as $file){
                if ($file != "." && $file != ".."){
                    $this->rcopy("$src/$file", "$dst/$file");
                }
            }  
        }
        else{
            if(file_exists($src)){
                copy($src, $dst);
            }
        }
    }
    
    //获取文件列表
    public function getFile($dir) {
        $fileArray[]=NULL;
        if (false != ($handle = opendir ( $dir ))) {
            $i=0;
            while ( false !== ($file = readdir ( $handle )) ) {
                //去掉"“.”、“..”以及带“.xxx”后缀的文件
                if ($file != "." && $file != ".."&&strpos($file,".")) {
                    $fileArray[$i] = $file;
                    if($i==100){
                        break;
                    }
                    $i++;
                }
            }
            //关闭句柄
            closedir ( $handle );
        }
        return $fileArray;
    } 
    
        //获取文件列表
    public function getDir($dir) {
        $fileArray[]=NULL;
        if (false != ($handle = opendir ( $dir ))) {
            $i=0;
            while ( false !== ($file = readdir ( $handle )) ) {
                //去掉"“.”、“..”以及带“.xxx”后缀的文件
                if ($file != "." && $file != "..") {
                    $fileArray[$i] = $file;
                    if($i==100){
                        break;
                    }
                    $i++;
                }
            }
            //关闭句柄
            closedir ( $handle );
        }
        return $fileArray;
    }
    
    /*
     * 上传模板 
     *
     */
    public function uploadTemplate(){
        $file = Input::file('file');
        if($file -> isValid()){
            //$truth_name=$file->getClientOriginalName();
            $type = $file->getClientOriginalExtension();
            $truth_name=date('ymd').mt_rand(100,999).'.'.$type;
            if($type=="zip"){
                if(file_exists(public_path("temp_templates/$truth_name"))){
                    echo "上传失败，已有同名模板存在";
                }else{
                    $up_result=$file->move(public_path("temp_templates/"),$truth_name);
                    if($up_result){
                        $tpl_name = trim(Input::get('tpl_name'));
                        if(!empty($tpl_name)){
                            $this->_remove_Dir(public_path("templates/$tpl_name"));
                            $this->_remove_Dir(app_path("views/templates/$tpl_name"));
                        }
                        echo $this->saveTemplate($truth_name,$tpl_name);
                    }else{
                        echo "上传失败";
                    }
                }
            }else{
                echo "模板上传失败，请上传正确的文件类型";
            }
        }
    }
    
    //模板入库
    public function saveTemplate($truth_name,$tpl_name=''){
        if($tpl_name!=''){
            $tpl_exists=Template::where('name',$tpl_name)->first();
            if($tpl_exists){
                $unpack_resuslt=$this->unpack($truth_name,$tpl_name,true);
            }
        }else{
            $tpl_exists=false;
            $unpack_resuslt=$this->unpack($truth_name,$tpl_name,false);
        }
        if($unpack_resuslt){
            $tpl_info=$unpack_resuslt['config'];
            if($tpl_exists){
                $template=Template::find($tpl_exists->id);
            }else{
                $template = new Template;
                $template->name=$unpack_resuslt['tpl_dir'];
                $template->tpl_num=$unpack_resuslt['tpl_num'];
            }
            $template->tpl_name=$tpl_info['template']['tpl_name'];
            $template->classify=$tpl_info['template']['classify'];
            $template->demo=$tpl_info['template']['demo'];
            $template->type=$tpl_info['template']['type'];
            $template->description=$tpl_info['template']['description'];
            $template->list1showtypetotal=$tpl_info['template']['list1showtypetotal'];
            $template->list2showtypetotal=$tpl_info['template']['list2showtypetotal'];
            $template->list3showtypetotal=$tpl_info['template']['list3showtypetotal'];
            $template->list4showtypetotal=$tpl_info['template']['list4showtypetotal'];
            $insert_rst=$template->save();
            if($insert_rst){
                $insert_id=$template->id;
                $color_arr=$tpl_info['tpl_color'];
                $tpl_color=array();
                $i=0;
                TemplateToColor::where('template_id',$insert_id)->delete();
                if(count($color_arr) > 0){
                    foreach($color_arr as $color){
                        $tpl_color[$i]['template_id']=$insert_id;
                        $tpl_color[$i]['color_code']=Config::get('color.'.$color);
                        $tpl_color[$i]['color_id']=Color::where('color_en',$color)->pluck('id');  
                        $i++;
                    }
                    TemplateToColor::insert($tpl_color);
                }
            }
            $result = ['err' => 0, 'msg' => '上传模板成功'];
        }else{
            $result = ['err' => 1001, 'msg' => '解压文件失败'];
        }
        return Response::json($result);
    } 
    
    //解包并分配模板文件
    private function unpack($tpl_pack,$tpl_name,$tpl_exists=false){
        $zip = new ZipArchive;
        if($zip->open(public_path("temp_templates/$tpl_pack"))===true){
            $file_info=pathinfo($tpl_pack);
            @mkdir(public_path('temp_templates/'.$file_info['filename']));
//            for($i = 0; $i < $zip->numFiles; $i++) {
//                $filename = $zip->getNameIndex($i);
//                if(!mb_detect_encoding($filename,array('GBK'))){
//                    $filename= mb_convert_encoding($filename, 'GBK',mb_detect_encoding($filename));
//                }
//                dd(zip_read($filename));
//                $zip->extractTo(public_path('temp_templates/'.$file_info['filename']),$filename);
//            }
            
            $zip->extractTo(public_path('temp_templates/'.$file_info['filename']));
            $zip->close();
            if(file_exists(public_path('temp_templates/'.$file_info['filename'].'/config.ini'))){
                $dir_site=public_path('temp_templates/'.$file_info['filename']);
            }else{          
                $child_dir=$this->getDir(public_path('temp_templates/'.$file_info['filename']).'/');
                $dir_site=public_path('temp_templates/'.$file_info['filename'].'/'.$child_dir[0]);
            }
            // 其他json文件验证
            $config_arr=parse_ini_file($dir_site.'/config.ini',true);
            if(!is_array($config_arr)) dd('【config.ini】文件不存在！文件格式说明详见：http://pme/wiki/doku.php?id=ued:template:config');
            $type=$config_arr['Config']['Type'];
            if($tpl_exists){
                if(substr_count(strtolower($type),'pc')){
                    $type=1;
                }else{
                    $type=2;
                }
                $tpl_dir=$tpl_name;
                $new_num='';

            }else{
                if(substr_count(strtolower($type),'pc')){
                    $type=1;
                    $tpl_dir="GP";
                }else{
                    $type=2;
                    $tpl_dir="GM";
                }
                $last_num=Template::where('type',$type)->max('tpl_num');
                $new_num=$last_num+1;
                $tpl_dir=$tpl_dir.str_repeat('0', 4-strlen($new_num)).$new_num;
            }

            //配置数据
            $data=array();
            $data['template']=array(
                'tpl_name'=>$config_arr['Template']['Name'],
                'classify'=>$config_arr['Config']['Category'],
                'demo'=>$config_arr['Template']['URL'],
                'type'=>$type,
                'description'=>$config_arr['Template']['Description'],
                'list1showtypetotal'=>($type==1)?0:$config_arr['Config']['List1ShowtypeTotal'],
                'list2showtypetotal'=>($type==1)?0:$config_arr['Config']['List2ShowtypeTotal'],
                'list3showtypetotal'=>($type==1)?0:$config_arr['Config']['List3ShowtypeTotal'],
                'list4showtypetotal'=>($type==1)?0:$config_arr['Config']['List4ShowtypeTotal'],
            );
            if(trim($config_arr['Config']['StyleColors'])!=""){
                $color_arr=explode(',',$config_arr['Config']['StyleColors']);
            }else{
                $color_arr=array();    
            }
            $data['tpl_color']=$color_arr;
            @unlink(public_path("temp_templates/$tpl_pack"));
            @unlink($dir_site.'/preview.js');
            if(!file_exists(app_path("views/templates/$tpl_dir"))){
                mkdir(app_path("views/templates/$tpl_dir"));
            }
            $this->rcopy($dir_site,public_path("templates/$tpl_dir"));
            @$this->_remove_Dir(public_path('temp_templates/'.$file_info['filename']));
            $file_list=$this->getFile(public_path("templates/$tpl_dir"));
            if(!file_exists(public_path("templates/$tpl_dir/json"))){
                mkdir(public_path("templates/$tpl_dir/json"));
            }
            foreach($file_list as $file_name){
                $file_type=explode('.',$file_name);
                $file_type=end($file_type);
                switch($file_type){
                    case "json" :
                        rename(public_path("templates/$tpl_dir/$file_name"),public_path("templates/$tpl_dir/json/$file_name"));
                        break;
                    case "html" :
                        $pattern=array("/\<script(.*)preview\.js(.*)\<\/script\>/i","/\<!--(.*)\{(.*)\}(.*)--\>/i");
                        file_put_contents(public_path("templates/$tpl_dir/$file_name"),preg_replace($pattern,'',file_get_contents(public_path("templates/$tpl_dir/$file_name"))));
                        rename(public_path("templates/$tpl_dir/$file_name"),app_path("views/templates/$tpl_dir/$file_name"));
                        break;
                }
            }
            return array('tpl_dir'=>$tpl_dir,'tpl_num'=>$new_num,'config'=>$data);
        }else{
            @unlink(public_path("temp_templates/$tpl_pack"));
            return false;
        }
    } 
    
    ###############################################
    public function pushFile(){
        $cus_id = Auth::id();
        $customerinfo = CustomerInfo::where('cus_id',$cus_id)->first();
        $pushed_at = strtotime($customerinfo->pushed_at);
        $updated_at = strtotime($customerinfo->updated_at);
        if($pushed_at==NULL || $pushed_at<$updated_at){//整站重新生成html
            //只需推送$customer.'.zip',不生成$customer.'_update.zip'
        }
        else{
            $pc_classify_updated = FALSE;
            $mobile_classify_updated = FALSE;
            $pc_classify_updated_at = Classify::where('cus_id',$cus_id)->where('pc_show',1)->lists('updated_at');
            $mobile_classify_updated_at = Classify::where('cus_id',$cus_id)->where('mobile_show',1)->lists('updated_at');
            foreach ($pc_classify_updated_at as $v) {
                if($pushed_at<strtotime($v)){
                    $pc_classify_updated = TRUE;
                    break;
                }
            }
            foreach ($mobile_classify_updated_at as $v) {
                if($pushed_at<strtotime($v)){
                    $mobile_classify_updated = TRUE;
                    break;
                }
            }
            /*
            /*找出PC生成html的部分
            */
            if($pc_classify_updated ||'PC模版更换'){//PC所有页面重新生成html

            }
            else{
                $pc_article_updated_at = Articles::where('cus_id',$cus_id)->where('pc_show',1)->lists('updated_at');
                $cids = explode(',',$this->getChirldenCid($v['value']['id']));//取得所有栏目id
                //PC文章修改--->其栏目、父级及长辈级栏目、文章页重新生成html
                //PC模版颜色更换

            }

            /*
            /*找出手机生成html的部分
            */
            if($pc_classify_updated){//手机所有页面重新生成html

            }
            else{
                //手机文章修改--->其栏目、父级及长辈级栏目、文章页重新生成html
                //手机模版颜色更换

            }
            //更新$customer.'.zip'，创建$customer.'_update.zip'，推送$customer.'_update.zip'，删除$customer.'_update.zip'
        }
        
    }
}