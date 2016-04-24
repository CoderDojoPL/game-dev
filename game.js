
function Character(x,y,engine){
	var prv={};
	var pub=this;


	prv.init=function(x,y,engine){
		prv.direction=1;
		prv.image=new Image();
		prv.image.src='character.png';
		prv.engine=engine;
		prv.state='stay';
		prv.stateStart=Date.now();
		prv.frame=0;
		prv.pos={x:x,y:y};
		prv.isJump=false;
		prv.isFall=true;
		prv.isRestore=true;
		prv.stateTime=Date.now();
		prv.restoreDest=Date.now()+1200;
		prv.isKick=false;
	}


	pub.controller=function(drawStart,diff){

		var inputManager=prv.engine.getInputManager();
		if(inputManager.isPress(inputManager.KEY_SPACE)){
			if(!prv.isKick){
				prv.isKick=true;
				prv.stateTime=Date.now();
				prv.kickDest=Date.now()+600;
				prv.state='stay';
			}
		}
		else if(!prv.isKick || prv.kickDest<Date.now()){
			prv.isKick=false;
			if(inputManager.isPress(inputManager.KEY_ARROW_LEFT)){
				prv.direction=-1;
				prv.state='run';			
			}
			else if(inputManager.isPress(inputManager.KEY_ARROW_RIGHT)){
				prv.direction=1;
				prv.state='run';
			}
			else{
				prv.state='stay';
			}

		}



		if(inputManager.isPress(inputManager.KEY_ARROW_UP) && !prv.isJump && !prv.isFall){
			prv.jumpDest=Date.now()+700;
			prv.isJump=true;
			prv.stateTime=Date.now();
		}


		if(prv.isRestore){
			if(prv.restoreDest<Date.now()){
				prv.isRestore=false;
			}

			return;

		}

		if(prv.state=='run'){
			var x=prv.pos.x+(30/diff)*prv.direction;
			if(!prv.engine.getGround().isColision({x:x,y:prv.pos.y+pub.getHeight()},1) && !prv.engine.getGround2().isColision({x:x,y:prv.pos.y+pub.getHeight()},1)){
				prv.pos.x=x;
			}

		}

		//skok
		if(prv.isJump){
			var y=prv.pos.y-(40/diff);
			if(!prv.engine.getGround().isColision({x:prv.pos.x,y:y+pub.getHeight()},1) && !prv.engine.getGround2().isColision({x:prv.pos.x,y:y+pub.getHeight()},1)){
				if(prv.jumpDest>Date.now()){
					prv.pos.y=y;
				}
				else
					prv.isJump=false;
			}
			else{
				prv.isJump=false;
			}
		}

		//grawitacja
		if(!prv.isJump){
			var y=prv.pos.y+(40/diff);
			if(!prv.engine.getGround().isColision({x:prv.pos.x,y:y+pub.getHeight()},-1) && !prv.engine.getGround2().isColision({x:prv.pos.x,y:y+pub.getHeight()},-1)){
				if(!prv.isFall){
					prv.stateTime=Date.now();					
				}

				prv.pos.y=y;			
				prv.isFall=true;
			}
			else{
				prv.isFall=false;
			}

		}


	}

	pub.update=function(context,drawStart,diff){
		if(prv.isRestore){
			prv.updateRestore(context,drawStart,diff);
		}
		else if(prv.isKick){
			prv.updateKick(context,drawStart,diff);
		}
		else if(prv.isJump){
			prv.updateJump(context,drawStart,diff);

		}
		else if(prv.isFall){
			prv.updateFall(context,drawStart,diff);
		}
		else if(prv.state=='run'){
			prv.updateRun(context,drawStart,diff);
		}
		else if(prv.state=='stay'){
			prv.updateStay(context,drawStart,diff);
		}
		else if(prv.state=='jump'){
			prv.updateJump(context,drawStart,diff);
		}
	}

	prv.updateRun=function(context,drawStart,diff){
		var frameTime=150;
		var maxFrame=10;
		var duration=drawStart-prv.stateTime;
		var milisecondFrames=duration%(frameTime*maxFrame);
		var currentFrame=parseInt(milisecondFrames/(frameTime));
		context.drawImage(prv.image //grafika
			,currentFrame*44 , pub.getHeight()*(prv.direction>0?3:4) //punkt od którego kadrować
			,44,pub.getHeight() //skala obrazka
			,prv.pos.x,prv.pos.y //współrzędne rysowania
			,44,pub.getHeight()//wielkość obrazka
		);

	}

	prv.updateStay=function(context,drawStart,diff){

		var frameTime=150;
		var maxFrame=30;
		var duration=drawStart-prv.stateTime;
		var milisecondFrames=duration%(frameTime*maxFrame);
		var currentFrame=parseInt(milisecondFrames/(frameTime));
		if(currentFrame>5){
			currentFrame=0;
		}

		context.drawImage(prv.image //grafika
			,currentFrame*44 , pub.getHeight()*(prv.direction>0?1:2) //punkt od którego kadrować
			,44,pub.getHeight() //skala obrazka
			,prv.pos.x,prv.pos.y //współrzędne rysowania
			,44,pub.getHeight()//wielkość obrazka
		);

	}

	prv.updateJump=function(context,drawStart,diff){

		var frameTime=150;
		var maxFrame=5;
		var duration=drawStart-prv.stateTime;
		var milisecondFrames=duration%(frameTime*maxFrame);
		var currentFrame=parseInt(milisecondFrames/(frameTime));
		context.drawImage(prv.image //grafika
			,44*currentFrame , pub.getHeight()*(prv.direction>0?5:6) //punkt od którego kadrować
			,44,pub.getHeight() //skala obrazka
			,prv.pos.x,prv.pos.y+1 //współrzędne rysowania
			,44,pub.getHeight()//wielkość obrazka
		);

	}

	prv.updateFall=function(context,drawStart,diff){
		var frameTime=150;
		var maxFrame=5;
		var duration=drawStart-prv.stateTime;
		var milisecondFrames=duration%(frameTime*maxFrame);
		var currentFrame=parseInt(milisecondFrames/(frameTime))+4;
		context.drawImage(prv.image //grafika
			,44*currentFrame , pub.getHeight()*(prv.direction>0?5:6) //punkt od którego kadrować
			,44,pub.getHeight() //skala obrazka
			,prv.pos.x,prv.pos.y+1 //współrzędne rysowania
			,44,pub.getHeight()//wielkość obrazka
		);

	}

	prv.updateRestore=function(context,drawStart,diff){
		var frameTime=150;
		var maxFrame=8;
		var duration=drawStart-prv.stateTime;
		var milisecondFrames=duration%(frameTime*maxFrame);
		var currentFrame=parseInt(milisecondFrames/(frameTime));
		context.drawImage(prv.image //grafika
			,44*currentFrame , pub.getHeight()*0 //punkt od którego kadrować
			,44,pub.getHeight() //skala obrazka
			,prv.pos.x,prv.pos.y+1 //współrzędne rysowania
			,44,pub.getHeight()//wielkość obrazka
		);

	}

	prv.updateKick=function(context,drawStart,diff){
		var frameTime=150;
		var maxFrame=4;
		var duration=drawStart-prv.stateTime;
		var milisecondFrames=duration%(frameTime*maxFrame);
		var currentFrame=parseInt(milisecondFrames/(frameTime));
		context.drawImage(prv.image //grafika
			,44*currentFrame , pub.getHeight()*(prv.direction>0?7:8) //punkt od którego kadrować
			,44,pub.getHeight() //skala obrazka
			,prv.pos.x,prv.pos.y+1 //współrzędne rysowania
			,44,pub.getHeight()//wielkość obrazka
		);

	}

	pub.getHeight=function(){
		return 60;
	}

	prv.init(x,y,engine);

}

function Ground(width,height){
	var prv={};
	var pub=this;


	prv.init=function(width,height){
		prv.image=new Image();
		prv.image.src='ground.png';
		prv.width=width;
		prv.height=height;

	}

	pub.update=function(context,drawStart,diff){
		var y=prv.height-prv.image.height;

		var stage=Math.ceil(prv.width/prv.image.width);
		for(var i=0; i<stage; i++){
			context.drawImage(prv.image //grafika
				,0,0 //punkt od którego kadrować
				,prv.image.width,prv.image.height //skala obrazka
				,i*prv.image.width,y //współrzędne rysowania
				,prv.image.width,prv.image.height //wielkość obrazka
			);

		}

	}

	pub.isColision=function(pos,vector){
		return (pos.y>prv.height-prv.image.height && pos.y<prv.height) && (pos.x>0 && pos.x<prv.width) && (vector==-1) 
||  (pos.x>0 && pos.x<prv.width) && (pos.y<prv.height+prv.image.height && pos.y>prv.height-prv.image.height) && (vector==1);
	}

	prv.init(width,height);

}

function InputManager(){
	var prv={};
	var pub=this;

	prv.init=function(){ 
		pub.KEY_ARROW_LEFT=37;
		pub.KEY_ARROW_UP=38;
		pub.KEY_ARROW_RIGHT=39;
		pub.KEY_SPACE=32;
		prv.keyDown=[];

		document.addEventListener('keydown',function(e){
			if(prv.keyDown.indexOf(e.keyCode)==-1){
				prv.keyDown.push(e.keyCode);
			}
		});


		document.addEventListener('keyup',function(e){
			if(prv.keyDown.indexOf(e.keyCode)!=-1){
				prv.keyDown.splice(prv.keyDown.indexOf(e.keyCode));
			}
		});
	}

	pub.isPress=function(key){
		return prv.keyDown.indexOf(key)!=-1;
	}


	prv.init();

}

function Game(){
	var prv={};
	var pub=this;

	prv.init=function(){
		prv.inputManager=new InputManager();
		prv.canvas=document.querySelector('canvas');
		prv.canvas.width = document.body.clientWidth; //document.width is obsolete
		prv.canvas.height = document.body.clientHeight-3;
		prv.context = prv.canvas.getContext("2d");	
		prv.character=new Character(10,10,pub);
		prv.ground=new Ground(prv.canvas.width,prv.canvas.height);

		prv.ground2=new Ground(300,prv.canvas.height-100);


		prv.startTime=Date.now();
		prv.background=new Image();
		prv.background.src='background.png';
		setInterval(prv.draw, 1000 / 60);
 
	}

	pub.getInputManager=function(){
		return prv.inputManager;
	}

	prv.draw=function(){
		prv.context.clearRect(0,0,prv.canvas.width,prv.canvas.height);
		var drawStart = Date.now();
		var diff = drawStart - prv.startTime;
//		prv.context.save();
		prv.update(prv.context,drawStart,diff);
        prv.startTime = drawStart;
//		prv.context.restore();
	}


	prv.update=function(context,drawStart,diff){
		prv.character.controller(drawStart,diff);

		context.drawImage(prv.background //grafika
			,0,0 //punkt od którego kadrować
			,prv.background.width,prv.background.height-60 //skala obrazka
			,0,0 //współrzędne rysowania
			,prv.canvas.width,prv.canvas.height //wielkość obrazka
		);

		prv.ground.update(context,drawStart,diff);
		prv.ground2.update(context,drawStart,diff);
		prv.character.update(context,drawStart,diff);
	}

	pub.getGround=function(){
		return prv.ground;
	}

	pub.getGround2=function(){
		return prv.ground2;
	}

	prv.init();
}



var g=new Game();

