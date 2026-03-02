// console.log("lcx_beautiful");
// alert可以产生弹窗

$(function(){
	var stage=document.getElementById("stage");
	var bg1=stage.getElementsByClassName("bg1")[0];
	var bg2=stage.getElementsByClassName("bg2")[0];
	var needle=stage.getElementsByClassName("needle")[0];
	var viruses=stage.getElementsByClassName("virus");
	var waters=stage.getElementsByClassName("water");
	var bgmp3=document.getElementById("bgmp3");
	// 时钟
	var keyboard_timer;
	var collision_timer;
	var produceVirus_timer;
	var virusMove_timer;
	var virusClear_timer;
	var backMove_timer;
	var updateScore_timer;
	var autoSpray=null;//自动发射时钟
	var isStart=false;
	// 游戏得分  玩家生命值  击败病毒  遗漏病毒
	var score,playLife,defeatVirus,omitVirus;
	// true表示使用键盘控制；false表示使用鼠标控制
	var keyboardSwitch=true;
	var sprayMusicFlag=true;//true手动，false自动
	// 键盘控制的数组：上、右、下、左(1:按下  0:未按下)
	var needle_direction=[0,0,0,0];
	
	// 开始游戏按钮
	$("#startBtn").click(function(){
		//载入音乐
		bgmp3.currentTime=0;
		bgmp3.play();
		initialize();
		startGame();
	});
	$("#directStart").click(function(){
		bgmp3.currentTime=0;
		bgmp3.play();
		$(".helpUI").hide();
		initialize();
		startGame();
	})
	// 帮助按钮
	$("#helpBtn").click(function(){
		$(".helpUI").show();
	})
	// 返回主页
	$("#home").click(function(){
		$(".helpUI").hide();
	})
	$("#returnHome").click(function(){
		clearInterval(produceVirus_timer);
		clearInterval(virusMove_timer);
		clearInterval(virusClear_timer);
		clearInterval(backMove_timer);
		$(".gameScore").hide();
		$(".startGame").show();
	})
	// 再玩一次
	$("#replayBtn").click(function(){
		// 移除得分详情
		$(".gameScore").hide();
		startGame();
	})
	// 初始化
	function initialize(){
		
		// 背景移动
		var bgleft1=0;
		var bgleft2=900;
		// sum表示当前背景移动的像素数
		var sum=0;
		backMove_timer=setInterval(function(){
			// console.log("lcx_most_beautiful");
			bgleft1--;
			bgleft2--;
			sum++;
			$(bg1).css({"left":bgleft1});
			$(bg2).css({"left":bgleft2});
			if(sum==900){
				bgleft1=900;
			}else if(sum==1800){
				bgleft2=900;
				sum=0;
			}
		},30);
		produceVirus_timer=produceVirus();
		virusMove_timer=virusMove();
		virusClear_timer=virusClear();
	}
	
	// 键盘监听事件,使工具移动
	document.onkeydown=function(move){
		if(move.key=="w"){
			needle_direction[0]=1;
		}else if(move.key=="d"){
			needle_direction[1]=1;
		}else if(move.key=="s"){
			needle_direction[2]=1;
		}else if(move.key=="a"){
			needle_direction[3]=1;
		}
		// 选择键盘or鼠标操控
		if(isStart){
			if(move.key=="1"){
				keyboardSwitch=true;
				keyboard_timer=monitorKeyboard();
			}
			if(move.key=="2"){
				keyboardSwitch=false;
				clearInterval(keyboard_timer);
			}
		}
		
	}
	document.onkeyup=function(move){
		if(move.key=="w"){
			needle_direction[0]=0;
		}else if(move.key=="d"){
			needle_direction[1]=0;
		}else if(move.key=="s"){
			needle_direction[2]=0;
		}else if(move.key=="a"){
			needle_direction[3]=0;
		}
	}
	
	document.onkeypress=function(move){	
		if(isStart){
			// 选择自动or手动发射药水("q" or "e")
			if(move.key=="q"){
				if(autoSpray==null)
					autoSpray=setInterval(sprayWater,500);
			}else if(move.key=="e"){
				if(autoSpray!=null){
					clearInterval(autoSpray);
					autoSpray=null;
				}else{
					sprayWater(sprayMusicFlag);
				}
			}
		}
		
	}
	// keyboard_timer=monitorKeyboard();
	// 针管跟随鼠标移动
	document.onmousemove=function(mouse_move){
		// 如果为true则使用键盘，不必跟随鼠标
		if(keyboardSwitch) return;
		var needleX=mouse_move.clientX-parseFloat($(stage).css("margin-left"));
		var needleY=mouse_move.clientY;
		$(needle).css({"left":needleX-$(needle).width()/2,"top":needleY-$(needle).height()/2});
	}


	
	
	function startGame(){
		// 隐藏开始界面
		$(".startGame").hide();
		$(".functionBoard").show();
		isStart=true;
		keyboardSwitch=true;
		
		score=0;
		playLife=100;
		defeatVirus=0;
		omitVirus=0;
		updateHealthPoint(playLife);
		// 生成玩家———武器出场
		$("<div class=\"needle\"></div>").appendTo(stage);
		needle_direction=[0,0,0,0];
		needle=stage.getElementsByClassName("needle")[0];
		var appeartimer=setInterval(function(){
			if(parseFloat($(needle).css("left"))>50){
				clearInterval(appeartimer);
			}else{
				$(needle).css({"left":parseFloat($(needle).css("left"))+4});
			}
		},10);
		// 病毒清屏
		$(viruses).remove();
		clearInterval(produceVirus_timer);
		produceVirus_timer = produceVirus();
		// 开启碰撞检测  药水动画  药水清除  武器控制
		collision_timer=monitorCollision();
		waterMove_timer=waterMove();
		waterClear_timer=waterClear();
		keyboard_timer=monitorKeyboard();
		updateScore_timer=updateCurrentScore();
	}
	function gameOver(failed){
		// 关闭时钟
		clearInterval(collision_timer);
		clearInterval(waterMove_timer);
		clearInterval(waterClear_timer);
		clearInterval(keyboard_timer);
		clearInterval(updateScore_timer);
		if(autoSpray!=null){
			clearInterval(autoSpray);
			autoSpray=null;
		}
		isStart=false;
		// $(needle).hide();
		$(viruses).remove();
		$(needle).remove();
		$(waters).remove();
		if(failed){
			$("#next").hide();
		}
		else{
			$("#next").show();
		}
		var tableResult="<tr>\
							<td>"+playLife+"</td>\
							<td>"+defeatVirus+"</td>\
							<td>"+omitVirus+"</td>\
							<td>"+score+"</td>\
						</tr>";
		$("#scoreTable").html(tableResult);
		$(".functionBoard").hide();
		$(".gameScore").show();
	}
	// 产生病毒
	function produceVirus(){
		// 产生病毒（先产生一个）
		var virusId=parseInt(Math.random()*3)+1;
		var virusHs=[121,151,146];
		var rndtop=parseInt(Math.random()*($(stage).height()-virusHs[virusId-1]))+1;
		$("<div class=\"virus virus"+virusId+"\"></div>").css({"top":rndtop}).appendTo("#stage");
		if(score>=200){
			// 每隔0.9s产生一个
			return setInterval(function(){
				var virusId=parseInt(Math.random()*3)+1;
				// 针对每个病毒的不同高度，随机产生病毒时，其位置需要不同的数值设定
				var virusHs=[121,151,146];
				// 病毒产生的随机高度
				var rndtop=parseInt(Math.random()*($(stage).height()-virusHs[virusId-1]))+1;
				// 随机产生病毒
				$("<div class=\"virus virus"+virusId+"\"></div>").css({"top":rndtop}).appendTo("#stage");
			},900);
		}
		else{
			// 每隔1.5s产生一个
		return setInterval(function(){
			var virusId=parseInt(Math.random()*3)+1;
			// 针对每个病毒的不同高度，随机产生病毒时，其位置需要不同的数值设定
			var virusHs=[121,151,146];
			// 病毒产生的随机高度
			var rndtop=parseInt(Math.random()*($(stage).height()-virusHs[virusId-1]))+1;
			// 随机产生病毒
			$("<div class=\"virus virus"+virusId+"\"></div>").css({"top":rndtop}).appendTo("#stage");
		},1500);
		}
		
	}
	// 病毒移动
	function virusMove(){
		return setInterval(function(){
			for(var i=0;i<viruses.length;i++){
				// 可以设置不同的病毒移动速度
				if($(viruses[i]).attr("class")=="virus virus1"){
					$(viruses[i]).css("left",parseFloat($(viruses[i]).css("left"))-1);
				}else if($(viruses[i]).attr("class")=="virus virus2"){
					$(viruses[i]).css("left",parseFloat($(viruses[i]).css("left"))-2);
				}else if($(viruses[i]).attr("class")=="virus virus3"){
					$(viruses[i]).css("left",parseFloat($(viruses[i]).css("left"))-3);
				}
			}
		},10);
	}
	// 病毒移除
	function virusClear(){
		//离开屏幕的病毒移除
		return setInterval(function(){
			for(var i=0;i<viruses.length;i++){
				if(parseFloat($(viruses[i]).css("left"))<-160){
					$(viruses[i]).remove();
					omitVirus++;
				}
			}
		},900);
	}
	// 键盘移动控制
	function monitorKeyboard(){
		return setInterval(function(){
			if(needle_direction[0]==1 && parseFloat($(needle).css("top"))>-20 ){
				$(needle).css({"top":parseFloat($(needle).css("top"))-4});
			}else if(needle_direction[1]==1 && parseFloat($(needle).css("left"))<675){
				$(needle).css({"left":parseFloat($(needle).css("left"))+4});
			}else if(needle_direction[2]==1 && parseFloat($(needle).css("bottom"))>-20){
				// console.log(parseFloat($(needle).css("bottom")));
				$(needle).css({"top":parseFloat($(needle).css("top"))+4});
			}else if(needle_direction[3]==1 && parseFloat($(needle).css("left"))>0){
				$(needle).css({"left":parseFloat($(needle).css("left"))-4});
			}
		},10);
	}
	// 产生药水
	function sprayWater(flag){
		var waterLeft=parseFloat($(needle).css("left"))+200;
		var waterTop=parseFloat($(needle).css("top"))+11.25-45;
		$("<div class=\"water\"></div>").css({"left":waterLeft,"top":waterTop}).appendTo("#stage");
		// console.log(flag);
		// 攻击音效
		if(flag==null){
			$("#sp2mp3")[0].currentTime=0;
			$("#sp2mp3")[0].play();
		}else{
			$("#sp1mp3")[0].currentTime=0;
			$("#sp1mp3")[0].play();
		}
		
	}
	// 药水移动
	function waterMove(){
		return setInterval(function(){
			if(waters.length==0) return;
			for(var i=0;i<waters.length;i++){
				var waterL=parseFloat($(waters[i]).css("left"));
				$(waters[i]).css({"left":waterL+5})
			}
			
		},10);
	}
	// 药水清除
	function waterClear(){
		return setInterval(function(){
			for(var i=0;i<waters.length;i++){
				if(parseFloat($(waters[i]).css("left"))>900){
					$(waters[i]).remove();
				}
			}
		},500);
	}
	// 碰撞模型
	function collision(obj1,obj2){
		var a,b,c;
		a=$(obj1).height()/2+parseFloat($(obj1).css("top"))-$(obj2).height()/2-parseFloat($(obj2).css("top"));
		b=$(obj1).width()/2+parseFloat($(obj1).css("left"))-$(obj2).width()/2-parseFloat($(obj2).css("left"));
		c=$(obj1).height()/2+$(obj2).height()/2-30;
		if(a*a+b*b<=c*c){
			return true;
		}
		return false;
	}
	// 碰撞检测
	function monitorCollision(){
		// 碰撞动画
		var changeFlag = true;
		return setInterval(function(){
			// 药水与病毒碰撞
			for(var i=0;i<waters.length;i++){
				for(var j=0;j<viruses.length;j++){
					if(collision(waters[i],viruses[j])){
						// 音效
						$("#wou2mp3")[0].currentTime=0;
						$("#wou2mp3")[0].play();
						if($(viruses[j]).height()==121){
							score+=5;
						}else if($(viruses[j]).height()==151){
							score+=10;
						}else if($(viruses[j]).height()==146){
							score+=15
						}
						if(score>200 && changeFlag){
							clearInterval(produceVirus_timer);
							produceVirus_timer = produceVirus();
							changeFlag=false
						}
						if(score>500){
							gameOver(false);
						}
						$(waters[i]).remove();
						$(viruses[j]).remove();
						defeatVirus++;
						break;
					}
				}
			}
			// 玩家与病毒
			for(var i=0;i<viruses.length;i++){
				if(collision(needle,viruses[i])){
					playLife-=25;
					updateHealthPoint(playLife);
					omitVirus++;
					$(viruses[i]).remove();
					if(playLife==0){
						gameOver(true);
					}
					break;
				}
			}
		},1);
	}
	// 血条改变
	function updateHealthPoint(value) {
	    if (value <= 25) {
			document.getElementById("percent").style.backgroundColor= 'red';
	    }
		else{
			document.getElementById("percent").style.backgroundColor= 'rgb(119, 252, 137)';
		}
		$("#percent").width(value + '%');
	}
	//分数显示
	function updateCurrentScore(){
		setInterval(function(){
			var curscore = "得分：  " + score;
			$("#currentScore").html(curscore);
		},500);
	}

	
});


//自动打出药水
	// 方法一：
	// setInterval(function(){
	// 	var e=jQuery.Event("keypress");
	// 	e.key=" ";
	// 	// 自动触发按下空格
	// 	$(document).trigger(e);
	// },500);
	// 方法二setInterval(sprayWater,500);
