<?php

class TemplatesController extends BaseController{
    /*
	|--------------------------------------------------------------------------
	| 模版首页控制器
	|--------------------------------------------------------------------------
	|方法：
    |homepageInfo       首页详情
    |homepageModify     首页修改
    |homepagePreview    首页预览
    |categoryPreview    列表页预览
    |articlePreview     内容页预览
    |    
	*/

    //public function homepageInfo(){
    
    
    public function homepageInfo($page='index'){
        $pagedata = new PrintController;
        $data = $pagedata->pagedata($page);
        $data_final = $data;
        $classify = new Classify;
        foreach($data as $k=>$v){
            if($v['type']=='list'){
                $type_arr=array(1,2,3);
                $list = Classify::where('cus_id', '=', $pagedata->cus_id)->whereIn('type',array(1,2,3,4,5,6))->where('pc_show','=',1)->get()->toArray();
                $value=array();
                $selected=false;
                foreach($list as $key=>$l){
                    $value[$key]['id'] = $l['id'];
                    $value[$key]['name'] = $l['name'];
                    $value[$key]['p_id'] = $l['p_id'];
                    $value[$key]['type'] = $l['type'];
                    if(isset($v['config']['id']) && $l['id']==$v['config']['id']){
                        $value[$key]['selected'] = 1;
                        $selected=true;
                    }
                    else{
                        $value[$key]['selected'] = 0;
                    }
                }
                if(isset($v['config']['filter'])){
                    if($v['config']['filter']=='page'){
                        $value = $classify->toTree($value); 
                        $type_arr=array(4);
                    }elseif($v['config']['filter']=='list'){
                        $value = $classify->toTree($value);   
                        $type_arr=array(1,2,3);
					}
					/*20151021添加feeback filter */
					elseif($v['config']['filter']=='feedback'){
                        $value = $classify->toTree($value);   
                        $type_arr=array(5);
                    }elseif($v['config']['filter']=='ALL'){
                        $value = $classify->toTree($value);   
                        $type_arr=array(1,2,3,4,5,6);
                    }else{
                        $value = $classify->toTree($value);   
                        $type_arr=array(1,2,3,4);
                    }
                }
                $this->unsetFalseClassify($value,$type_arr);
                if(!$selected && count($value)){
                    foreach($value as $key=>$v){
                        $value[$key]['selected']=1; 
                        break;
                    }
                }
                if(isset($v['config']['mustchild']) && $v['config']['mustchild']==true){
                    $this->unsetLastClassify($value);
                }
                $data_final[$k]['config']['list'] = $value;
                if(isset($v['config']['star_only'])){
                    $data_final[$k]['config']['star_only'] = $v['config']['star_only'];
                }else{
                    $data_final[$k]['config']['star_only'] = "0";
                }
            }elseif($v['type']=='page'){
                $list = Classify::where('cus_id', '=', $pagedata->cus_id)->where('type',4)->where('pc_show','=',1)->get()->toArray();
                $value=array();
                $selected=false;
                foreach($list as $key=>$l){
                    $value[$key]['id'] = $l['id'];
                    $value[$key]['name'] = $l['name'];
                    $value[$key]['p_id'] = $l['p_id'];
                    $value[$key]['type'] = $l['type'];
                    if(isset($v['config']['id']) && $l['id']==$v['config']['id']){
                        $value[$key]['selected'] = "1";
                        $selected=true;
                    }
                    else{
                        $value[$key]['selected'] = "0";
                    }
                }
                if(!$selected){
                    $value[0]['selected'] = 1;
                }
                if(isset($v['config']['mustchild']) && $v['config']['mustchild']==true){
                    $this->unsetLastClassify($value);
                }
                $data_final[$k]['config']['list'] = $value;
                if(isset($v['config']['star_only'])){
                    $data_final[$k]['config']['star_only'] = $v['config']['star_only'];
                }else{
                    $data_final[$k]['config']['star_only'] = "0";
                }               
            }elseif($v['type']=='navs'){
                $type_arr=array(1,2,3,4,6);
                $list = Classify::where('cus_id', '=', $pagedata->cus_id)->whereIn('type',array(1,2,3,4,6))->where('pc_show','=',1)->get()->toArray();
                $value=array();
                $selected=false;
                foreach($list as $key=>$l){
                    $value[$key]['id'] = $l['id'];
                    $value[$key]['name'] = $l['name'];
                    $value[$key]['p_id'] = $l['p_id'];
                    $value[$key]['type'] = $l['type'];
                    if(isset($v['config']['id']) && $l['id']==$v['config']['id']){
                        $value[$key]['selected'] = 1;
                        $selected=true;
                    }
                    else{
                        $value[$key]['selected'] = 0;
                    }
                }
                if(isset($v['config']['filter'])){
                    if($v['config']['filter']=='page'){
                        $value = $classify->toTree($value); 
                        $type_arr=array(4);
                    }elseif($v['config']['filter']=='list'){
                        $value = $classify->toTree($value);   
                        $type_arr=array(1,2,3);
                    }elseif($v['config']['filter']=='ALL'){
                        $value = $classify->toTree($value);   
                        $type_arr=array(1,2,3,4,6);
                    }else{
                        $value = $classify->toTree($value);   
                        $type_arr=array(1,2,3,4);
                    }
                }
                $this->unsetFalseClassify($value,$type_arr);
                if(!$selected && count($value)){
                    foreach($value as $key=>$v){
                        $value[$key]['selected']=1; 
                        break;
                    }
                }
                if(isset($v['config']['mustchild']) && $v['config']['mustchild']==true){
                    $this->unsetLastClassify($value);
                }
                $data_final[$k]['config']['list'] = $value;
                if(isset($v['config']['star_only'])){
                    $data_final[$k]['config']['star_only'] = $v['config']['star_only'];
                }else{
                    $data_final[$k]['config']['star_only'] = "0";
                }                
            }
        }
        //dd($data_final);
        return $data_final;
    }
    
    /*
     * 分类选择时剔除没用的分类
     *  
     */    
    public function unsetLastClassify(&$arr){
        if(!is_array($arr)){
            return $arr;
        }else{
            foreach($arr as $key=>$val){
                if(is_array($val) && isset($val['childmenu']) && is_array($val['childmenu']) && count($val['childmenu'])){
                    $this->unsetLastClassify($arr[$key]['childmenu']);
                }else{          
                    unset($arr[$key]);
                }
            }
        }
        return $arr;
    }
    
    /*
     * 分类选择时剔除没用的分类
     *  
     */
    public function unsetFalseClassify(&$arr,$type){
        if(!is_array($arr)){
            return $arr;
        }else{
            foreach($arr as $key=>$val){
                if(is_array($arr[$key]) && isset($arr[$key]['childmenu']) && is_array($arr[$key]['childmenu']) && count($arr[$key]['childmenu'])){
                    if(!count($this->unsetFalseClassify($arr[$key]['childmenu'], $type))){
                        if(!in_array($arr[$key]['type'],$type)){
                           unset($arr[$key]);
                        }
                    }
                }else{
                    if(!in_array($arr[$key]['type'],$type)){
                        unset($arr[$key]);
                    }
                }
            }
        }
        return $arr;
    }
    
    public function homepageManage(){
        $page = Input::get('page') ? Input::get('page') : 'index';
        $pagelist = $this->buttonList();
        $templedata = $this->homepageInfo($page);
        $cus_id = Auth::id();
        //$template_user = websiteInfo::leftJoin('template','template.id','=','website_info.pc_tpl_id')->where('website_info.cus_id',$cus_id)->pluck('template.cus_id');
        $pc_tpl_id = WebsiteInfo::where('cus_id',$cus_id)->pluck('pc_tpl_id');
        $my_tpl_name = Template::where('former_id',$pc_tpl_id)->where('cus_id',$cus_id)->pluck('name');
        $is_my_tpl = Template::where('id',$pc_tpl_id)->where('cus_id',$cus_id)->pluck('name');
        $my_tpl_num = count(Template::where('cus_id',$cus_id)->lists('id'));
        if($my_tpl_name || $is_my_tpl ||$my_tpl_num >=3){
            $coded = 1;
        }
        else{
            $coded = 0;
        }
        $data_final = ['err'=>0,'msg'=>'','data'=>['pagelist'=>$pagelist,'templedata'=>$templedata,'coded'=>$coded]];
        return Response::json($data_final);
    }

    public function homepageList(){
		$page = Input::get('page') ? Input::get('page') : 'index';
        $templedata = $this->homepageInfo($page);
        $data_final = ['err'=>0,'msg'=>'','data'=>$templedata];
        return Response::json($data_final);
    }

    public function buttonList(){
        $result = [];
        $cus_id = Auth::id();
        $themename = DB::table('template')->leftJoin('website_info','website_info.pc_tpl_id','=','template.id')->where('website_info.cus_id','=',$cus_id)->pluck('template.name');
        $directory = public_path('templates/'.$themename.'/json'); 
        $files = scandir($directory); 
        if(array_search('!database.json',$files)!==false){
            unset($files[array_search('!database.json',$files)]);
        }
        $files = array_slice($files,2);
        unset($files[array_search('index.json',$files)]);
        array_unshift($files,'index.json');
        foreach($files as $k => $f){
            $file_type = explode('.', $f);
            $result[$k]['page'] = $file_type[0];
            if(strpos($file_type[0],'pagenavs')!==false){
                $title="侧边导航";
            }elseif(strpos($file_type[0],'left')!==false){
                $title="左侧栏";
            }elseif(strpos($file_type[0],'right')!==false){
                $title="右侧栏";
            }elseif(strpos($file_type[0],'top')!==false || strpos($file_type[0],'header')!==false){
                $title="顶部";
            }elseif(strpos($file_type[0],'bottom')!==false || strpos($file_type[0],'footer')!==false){
                $title="底部";
            }elseif(strpos($file_type[0],'links')!==false){
                $title="友情链接";
            }else{
                $title="其他";  
            }
            $result[$k]['title'] = Config::get('file.'.$file_type[0],$title);
            if($file_type[0]=='index'){
                $result[$k]['url'] = asset('homepage-preview');
            }
            elseif($file_type[0]=='list-text'){
                $id = Classify::where('cus_id',$cus_id)->where('type',1)->pluck('id');
                $result[$k]['url'] = asset('category/'.$id.'.html');           
            }
            elseif($file_type[0]=='list-image'){
                $id = Classify::where('cus_id',$cus_id)->where('type',2)->pluck('id');
                $result[$k]['url'] = asset('category/'.$id.'.html');
            }
            elseif($file_type[0]=='list-imagetext'){
                $id = Classify::where('cus_id',$cus_id)->where('type',3)->pluck('id');
                $result[$k]['url'] = asset('category/'.$id.'.html');
            }
            else{
                $result[$k]['url'] = '';
            }
            
        }
        return $result;       
    }
    
    public function homepageModify(){
        $cus_id = Auth::id();
        $template_id = websiteInfo::where('cus_id',$cus_id)->pluck('pc_tpl_id');
        $website_config = new WebsiteConfig();
        $website_config->cus_id = $cus_id;
        $page = Input::get('page');
        $website_config->key = $page;
        $count = $website_config->where('cus_id',$cus_id)->where('template_id',$template_id)->where('key',$page)->count();
        $website_config->template_id = $template_id;
        $data = Input::get('data'); 
        /*
        if(isset($data['slidepics']) && count($data['slidepics'])){
            foreach($data['slidepics'] as &$arr){
                $arr['link']=$arr['href'];
                $arr['image']=basename($arr['src']);
                unset($arr['href']);
                unset($arr['src']);
            }
        }
         */
        foreach($data as $key=>$val){
            if(is_array($data[$key]) && count($data[$key])){
                if(array_key_exists("href",$data[$key]) || array_key_exists("src",$data[$key])){
                      $data[$key]['link']=$data[$key]['href'];
                      $data[$key]['image']=basename($data[$key]['src']);
                      unset($data[$key]['href']);
                      unset($data[$key]['src']);
                }else{
                    foreach($data[$key] as &$arr){
                        if(is_array($arr)){
                            if(array_key_exists("href",$arr) || array_key_exists("src",$arr)){
                                $arr['link']=$arr['href'];
                                $arr['image']=basename($arr['src']);
                                unset($arr['href']);
                                unset($arr['src']);
                            }                        
                        }
                    }
                }
            }
            $temp_arr=$data[$key];
            unset($data[$key]);
            $data[$key]['value']=$temp_arr;
        } 
        $website_config->value = serialize($data);
        if($count){
            $result = $website_config->where('cus_id',$cus_id)->where('template_id',$template_id)->where('key',$page)->update(['value'=>$website_config->value]);
        }
        else{
            $result = $website_config->save();
        }
        if($result){
            return Response::json(['err'=>0,'msg'=>'','data'=>null]);
        }else{
            return Response::json(['err'=>1001,'msg'=>'数据保存失败','data'=>null]);
        }
    }
    
    
    
    public function getMobilePageData(){
        $cus_id=Auth::id();
        $mobile=new PrintController('preview','mobile');
        $m_catlist=Classify::where('mobile_show',1)->where('cus_id',$mobile->cus_id)->whereIn('type',[1,2,3,4])->orderBy('sort')->select('id','name','p_id','type')->get()->toArray();
        $showtypetotal= WebsiteInfo::where('website_info.cus_id',$cus_id)->LeftJoin('template','mobile_tpl_id','=','template.id')->select('template.list1showtypetotal','template.list2showtypetotal','template.list3showtypetotal','template.list4showtypetotal')->first();
        if(count($m_catlist) > 0){
            foreach($m_catlist as &$m_arr){
                $liststr='list'.$m_arr['type'].'showtypetotal';
                $mobilehome_config=MobileHomepage::where('c_id',$m_arr['id'])->first();
                if($mobilehome_config){
                    $m_arr['showtypetotal']=$showtypetotal->$liststr;
                    if($m_arr['showtypetotal']){
                        $m_arr['index_show']=$mobilehome_config->index_show;
                        if($m_arr['showtypetotal']<$mobilehome_config->m_index_showtype){
                            $m_arr['showtype']=1;
                        }else{
                            $m_arr['showtype']=$mobilehome_config->m_index_showtype;
                        }
                    }else{
                        $m_arr['showtype']=1;
                        $m_arr['index_show']=0;
                    }
                    MobileHomepage::where('id',$mobilehome_config->id)->update(array('m_index_showtype'=>$m_arr['showtype'],'index_show'=>$m_arr['index_show']));
                    $m_arr['show_num']=$mobilehome_config->show_num;
                    $m_arr['star_only']=$mobilehome_config->star_only;
                    $m_arr['s_sort']=$mobilehome_config->s_sort;  
                }else{
                    $m_arr['index_show']=0;
                    $m_arr['show_num']=0;
                    $m_arr['star_only']=0;
                    $m_arr['s_sort']=0;
                    $m_arr['showtypetotal']=$showtypetotal->$liststr;
                    $m_arr['showtype']=0;
                }
                $sort_key[]=$m_arr['s_sort'];
            }
        }
        if(!empty($sort_key) || !empty($m_catlist)){
             array_multisort($sort_key,$m_catlist);
        }
        //$m_catlist=$this->toTree($m_catlist);
        $data=array();
        $pagelist[]=array('page'=>'index','title'=>'栏目排序','type'=>'category');
        $template_id = WebsiteInfo::where('cus_id',$mobile->cus_id)->pluck('mobile_tpl_id');
        $config_str = WebsiteConfig::where('cus_id',$mobile->cus_id)->where('type',2)->where('template_id',$template_id)->pluck('value');
        if($config_str){
            $config_arr = unserialize($config_str);
            if($config_arr['slidepics']['value']){
                ksort($config_arr['slidepics']['value'],SORT_NUMERIC);
            }
            if($config_arr['slidepics']['value']){
                $config_arr['slidepics']['value']=array_merge($config_arr['slidepics']['value']);
            }
        }else{
            $config_arr=$mobile->mobilePageList('global',true);
        }
        foreach($config_arr as $key => $val){
            $pagelist[]=array('page'=>$key,'title'=>$config_arr[$key]['description'],'type'=>$config_arr[$key]['type']);
            $data[$key]=$config_arr[$key];
        }
        $templatedata['templatedata']=$data;
        $templatedata['pagelist']=$pagelist;
        $templatedata['m_catlist']=$m_catlist;
        $mobile->replaceUrl($templatedata);
        $return_msg=array('err'=>0,'msg'=>'','data'=>$templatedata);
        return Response::json($return_msg);
    }
    
    public function mhomepageModify(){
        $cus_id = Auth::id();
        $template_id = WebsiteInfo::where('cus_id',$cus_id)->pluck('mobile_tpl_id');
        $data=Input::all();
        $keys=  array_keys($data);
        if($keys[0]=='slidepics'){
            if($data['slidepics']!=''){
                foreach($data['slidepics'] as $key=>$val){
                    $data['slidepics'][$key]['title']=$data['slidepics'][$key]['PC_name'];
                    $data['slidepics'][$key]['image']=basename($data['slidepics'][$key]['phone_info_pic']);
                    $data['slidepics'][$key]['link']=$data['slidepics'][$key]['PC_link'];
                    unset($data['slidepics'][$key]['PC_name']);
                    unset($data['slidepics'][$key]['phone_info_pic']);
                    unset($data['slidepics'][$key]['PC_link']);
                }
            }
        }
        $config_str = WebsiteConfig::where('cus_id',$cus_id)->where('type',2)->where('template_id',$template_id)->pluck('value');
        if($config_str){
            $config_arr = unserialize($config_str);
            $config_arr[$keys[0]]['value']=$data[$keys[0]];
        }else{
            $mobile=new PrintController('preview','mobile');
            $config_arr=$mobile->mobilePageList('global',true);
            $config_arr[$keys[0]]['value']=$data[$keys[0]];
        }
        $new_config_str = serialize($config_arr);
        if($config_str){
            $result = DB::table('website_config')->where('cus_id',$cus_id)->where('type',2)->where('template_id',$template_id)->update(array('value'=>$new_config_str));
        }else{
            $result = DB::table('website_config')->insert(array('cus_id' => $cus_id, 'type' => 2,'template_id'=>$template_id,'key'=>'global','value'=>$new_config_str));
        }
        if($result){
            $return_msg=array('err'=>0,'msg'=>'');
        }else{
            $return_msg=array('err'=>3001,'msg'=>'修改失败','data'=>array());
        }
        return Response::json($return_msg);
    }
    
    public function homepageSortModify(){
        $indexlist = Input::get('indexlist');
        $data = array();
        $err=false;
        $cus_id=Auth::id();
        if(count($indexlist) > 0){
            foreach($indexlist as $list){
                $classify = MobileHomepage::where('c_id',$list['id'])->first();
                if(!$classify){
                    $classify=new MobileHomepage();
                    $classify->index_show=0;
                    $classify->c_id=$list['id'];
                    $classify->cus_id=$cus_id;
                }
                $classify->s_sort=$list['indexs'];
                $result = $classify->save();
                if(!$result){
                    $data[]=$list['id'];
                    $err=true;
                }
            }
        }
        if($err){
            $return_msg=array('err'=>3001,'msg'=>'操作失败','data'=>$data);
        }else{
            $return_msg=array('err'=>0,'msg'=>'操作成功');
        }
        return Response::json($return_msg);
    }
    
    public function homepageBatchModify(){
        $ids=Input::get('id');
        $index_show=Input::get('show');
        $show_num=Input::get('total');
        $show_type=Input::get('showtype');
        $star_only=Input::get('star_only');
        $cus_id=Auth::id();
        if(is_array($ids)){
            $err=false;
            $data=array();
            foreach($ids as $id){
                $m_i_config = MobileHomepage::where('c_id','=',$id)->first();
                if(!$m_i_config){
                    $m_i_config=new MobileHomepage();
                    $m_i_config->c_id=$ids;
                    $m_i_config->cus_id=$cus_id;
                }
                if($index_show!=NULL){
                    $m_i_config->index_show=$index_show;
                }
                if($show_num!=NULL){
                    $m_i_config->show_num=$show_num;
                }
                if($star_only!=NULL){
                    $m_i_config->star_only=$star_only;
                }
                if($show_type!=NULL){
                    $m_i_config->m_index_showtype=$show_type;
                }
                $result=$m_i_config->save();
                if($result){
                    $data[]=$id;
                }else{
                    $err=true;
                }
            }
            if($err){
                $return_msg=array('err'=>3001,'msg'=>'操作失败','data'=>$data);
            }else{
                $return_msg=array('err'=>0,'msg'=>'操作成功');
            }
        }else{
            $m_i_config = MobileHomepage::where('c_id','=',$ids)->first();
            if(!$m_i_config){
                $m_i_config=new MobileHomepage();
                $m_i_config->c_id=$ids;
                $m_i_config->cus_id=$cus_id;
            }
            if($index_show!=NULL){
                $m_i_config->index_show=$index_show;
            }
            if($show_num!=NULL && is_numeric($show_num)){
                $m_i_config->show_num=$show_num;
            }
            if($show_type!=NULL && is_numeric($show_type)){
                $m_i_config->m_index_showtype=$show_type;
            }
            if($star_only!=NULL){
                $m_i_config->star_only=$star_only;
            }
            $result=$m_i_config->save();
            if($result){
                $return_msg=array('err'=>0,'msg'=>'操作成功');
            }else{
                $return_msg=array('err'=>3001,'msg'=>'操作失败','data'=>array());
            }
        }
        return Response::json($return_msg);
    }
    
    private function toTree($arr, $pid = 0) {
        $tree = array();
        foreach ($arr as $k => $v) {
            if ($v['p_id'] == $pid) {
                $tree[] = $v;
            }
        }
        if (empty($tree)) {
            return null;
        }
        foreach ($tree as $k => $v) {
            if($v['type']==1 || $v['type']==2 || $v['type']==3 || $v['type']==4){
                $tree[$k]['link'] = url('mcategory/'.$v['id'].'.html');
            }else{
                $tree[$k]['link'] = $v['url'];
            }
            $tree[$k]['childmenu'] = $this->toTree($arr, $v['id']);
        }
        return $tree;
    }
 
    /**
     * PC首页预览
     */
    public function homepagePreview(){
        $template = new PrintController();
        return $template->homepagePreview();
    }
    /**
     * PC栏目页预览
     */
    public function categoryPreview($id,$page=1){
        $template = new PrintController;
        return $template->categoryPreview($id,$page);
    }
    
    /**
     * PC内容页预览
     */
    public function articlePreview($id){
        $template = new PrintController;
        return $template->articlePreview($id);
    }
    
    /**
     * 手机首页预览
     */
    public function mhomepagePreview(){
        $template = new PrintController('preview','mobile');
        return $template->mhomepagePreview();
    }
    
    /**
     * 手机底部功能条
     */
    public function quickBarJson(){
        $template=new PrintController('preview','mobile');
        return $template->quickBarJson();
    }
    
    
    /**
     * 手机栏目预览
     */
    public function mcategoryPreview($id,$page=1){
        $template = new PrintController('preview','mobile');
        return $template->categoryPreview($id,$page);
    }
    
    /**
     * 手机内容页预览
     */
    public function marticlePreview($id){
        $template = new PrintController('preview','mobile');
        return $template->articlePreview($id);
    }
    
    /**
     * 获取搜索页数据
     */
    public function searchPreview($url,$type='pc'){
        $template = new PrintController('online',$type);
        return $template->sendCusAllData($url);
    }
    
    public function sendData(){
        $this->searchPreview('http://swap.gbpen.com/PostTemplates.php','pc');  
        $this->searchPreview('http://swap.gbpen.com/PostTemplates.php','mobile');  
    }
}