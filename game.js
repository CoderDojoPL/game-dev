/*
 * This file is part of the Game-dev project.
 *
 * (c) CoderDojo Polska Foundation
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Character class
 *
 * @author Michal Tomczak (m.tomczak@coderdojo.org.pl)
 */
function Character(x,y,engine){
	/**
	 * @var private attr
	 */
	var prv={};

	/**
	 * @var public attr
	 */
	var pub=this;

	/**
	 * Constructor
	 *
	 * @param int x
	 * @param int y
	 * @param Game engine
	 */
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

	/**
	 * Character controller
	 *
	 * @param long drawStart current epoch
	 * @param long diff diffrent time between frames
	 */
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

		//gravity
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

	/**
	 * Redraw character
	 *
	 * @param CanvasRenderingContext2D context
	 * @param long drawStart epoch
	 * @param long diff diffrent time between frames
	 */
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

	/**
	 * Character run animation
	 *
	 * @param CanvasRenderingContext2D context
	 * @param long drawStart epoch
	 * @param long diff diffrent time between frames
	 */
	prv.updateRun=function(context,drawStart,diff){
		var frameTime=150;
		var maxFrame=10;
		var duration=drawStart-prv.stateTime;
		var milisecondFrames=duration%(frameTime*maxFrame);
		var currentFrame=parseInt(milisecondFrames/(frameTime));
		context.drawImage(prv.image //image
			,currentFrame*44 , pub.getHeight()*(prv.direction>0?3:4) //cut point
			,44,pub.getHeight() //image scale
			,prv.pos.x,prv.pos.y //image coordiate
			,44,pub.getHeight()//image size
		);

	}

	/**
	 * Character stay animation
	 *
	 * @param CanvasRenderingContext2D context
	 * @param long drawStart epoch
	 * @param long diff diffrent time between frames
	 */
	prv.updateStay=function(context,drawStart,diff){

		var frameTime=150;
		var maxFrame=30;
		var duration=drawStart-prv.stateTime;
		var milisecondFrames=duration%(frameTime*maxFrame);
		var currentFrame=parseInt(milisecondFrames/(frameTime));
		if(currentFrame>5){
			currentFrame=0;
		}

		context.drawImage(prv.image //image
			,currentFrame*44 , pub.getHeight()*(prv.direction>0?1:2) //cut point
			,44,pub.getHeight() //image scale
			,prv.pos.x,prv.pos.y //coordinate draw
			,44,pub.getHeight()//image size
		);

	}

	/**
	 * Character jump animation
	 *
	 * @param CanvasRenderingContext2D context
	 * @param long drawStart epoch
	 * @param long diff diffrent time between frames
	 */
	prv.updateJump=function(context,drawStart,diff){

		var frameTime=150;
		var maxFrame=5;
		var duration=drawStart-prv.stateTime;
		var milisecondFrames=duration%(frameTime*maxFrame);
		var currentFrame=parseInt(milisecondFrames/(frameTime));
		context.drawImage(prv.image //image
			,44*currentFrame , pub.getHeight()*(prv.direction>0?5:6) //cut point
			,44,pub.getHeight() //image scale
			,prv.pos.x,prv.pos.y+1 //image coordiate
			,44,pub.getHeight()//image size
		);

	}

	/**
	 * Character fall animation
	 *
	 * @param CanvasRenderingContext2D context
	 * @param long drawStart epoch
	 * @param long diff diffrent time between frames
	 */
	prv.updateFall=function(context,drawStart,diff){
		var frameTime=150;
		var maxFrame=5;
		var duration=drawStart-prv.stateTime;
		var milisecondFrames=duration%(frameTime*maxFrame);
		var currentFrame=parseInt(milisecondFrames/(frameTime))+4;
		context.drawImage(prv.image //image
			,44*currentFrame , pub.getHeight()*(prv.direction>0?5:6) //cut point
			,44,pub.getHeight() //image scale
			,prv.pos.x,prv.pos.y+1 //image coordiate
			,44,pub.getHeight()//image size
		);

	}

	/**
	 * Character restore animation
	 *
	 * @param CanvasRenderingContext2D context
	 * @param long drawStart epoch
	 * @param long diff diffrent time between frames
	 */
	prv.updateRestore=function(context,drawStart,diff){
		var frameTime=150;
		var maxFrame=8;
		var duration=drawStart-prv.stateTime;
		var milisecondFrames=duration%(frameTime*maxFrame);
		var currentFrame=parseInt(milisecondFrames/(frameTime));
		context.drawImage(prv.image //image
			,44*currentFrame , pub.getHeight()*0 //cut point
			,44,pub.getHeight() //image scale
			,prv.pos.x,prv.pos.y+1 //image coordiate
			,44,pub.getHeight()//image size
		);

	}

	/**
	 * Character kick animation
	 *
	 * @param CanvasRenderingContext2D context
	 * @param long drawStart epoch
	 * @param long diff diffrent time between frames
	 */
	prv.updateKick=function(context,drawStart,diff){
		var frameTime=150;
		var maxFrame=4;
		var duration=drawStart-prv.stateTime;
		var milisecondFrames=duration%(frameTime*maxFrame);
		var currentFrame=parseInt(milisecondFrames/(frameTime));
		context.drawImage(prv.image //image
			,44*currentFrame , pub.getHeight()*(prv.direction>0?7:8) //cut point
			,44,pub.getHeight() //image scale
			,prv.pos.x,prv.pos.y+1 //image coordiate
			,44,pub.getHeight()//image size
		);

	}

	/**
	 * Get height character
	 *
	 * return int
	 */
	pub.getHeight=function(){
		return 60;
	}

	prv.init(x,y,engine);

}

/**
 * Ground class
 *
 * @author Michal Tomczak (m.tomczak@coderdojo.org.pl)
 */
function Ground(width,height){
	/**
	 * @var private attr
	 */
	var prv={};

	/**
	 * @var public attr
	 */
	var pub=this;

	/**
	 * Constructor
	 *
	 * @param int x
	 * @param int y
	 * @param Game engine
	 */
	prv.init=function(width,height){
		prv.image=new Image();
		prv.image.src='ground.png';
		prv.width=width;
		prv.height=height;

	}

	/**
	 * Redraw ground
	 *
	 * @param CanvasRenderingContext2D context
	 * @param long drawStart epoch
	 * @param long diff diffrent time between frames
	 */
	pub.update=function(context,drawStart,diff){
		var y=prv.height-prv.image.height;

		var stage=Math.ceil(prv.width/prv.image.width);
		for(var i=0; i<stage; i++){
			context.drawImage(prv.image //image
				,0,0 //cut point
				,prv.image.width,prv.image.height //skala obrazka
				,i*prv.image.width,y //image coordiate
				,prv.image.width,prv.image.height //image size
			);

		}

	}

	/**
	 * Check colision with character
	 *
	 * @param object pos ground position: x, y
	 * @param int vector -1 fall, 0 stay, 1 jump
	 */
	pub.isColision=function(pos,vector){
		return (pos.y>prv.height-prv.image.height && pos.y<prv.height) && (pos.x>0 && pos.x<prv.width) && (vector==-1) 
||  (pos.x>0 && pos.x<prv.width) && (pos.y<prv.height+prv.image.height && pos.y>prv.height-prv.image.height) && (vector==1);
	}

	prv.init(width,height);

}

/**
 * Input manager class (support keyboard).
 *
 * @author Michal Tomczak (m.tomczak@coderdojo.org.pl)
 */
function InputManager(){
	/**
	 * @var private attr
	 */
	var prv={};

	/**
	 * @var public attr
	 */
	var pub=this;

	/**
	 * Constructor
	 */
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

	/**
	 * Check press key
	 *
	 * @param int key key code
	 * @return boolean
	 */
	pub.isPress=function(key){
		return prv.keyDown.indexOf(key)!=-1;
	}


	prv.init();

}

/**
 * Game class
 *
 * @author Michal Tomczak (m.tomczak@coderdojo.org.pl)
 */
function Game(){
	/**
	 * @var private attr
	 */
	var prv={};

	/**
	 * @var public attr
	 */
	var pub=this;

	/**
	 * Constructor
	 */
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

	/**
	 * 
	 * @return InputManager
	 */
	pub.getInputManager=function(){
		return prv.inputManager;
	}

	/**
	 * Redraw frame
	 */
	prv.draw=function(){
		prv.context.clearRect(0,0,prv.canvas.width,prv.canvas.height);
		var drawStart = Date.now();
		var diff = drawStart - prv.startTime;
//		prv.context.save();
		prv.update(prv.context,drawStart,diff);
        prv.startTime = drawStart;
//		prv.context.restore();
	}

	/**
	 * Invoke controller and redraw screen.
	 *
	 * @param CanvasRenderingContext2D context
	 * @param long drawStart epoch
	 * @param long diff diffrent time between frames
	 */
	prv.update=function(context,drawStart,diff){
		prv.character.controller(drawStart,diff);

		context.drawImage(prv.background //image
			,0,0 //cut point
			,prv.background.width,prv.background.height-60 //image scale
			,0,0 //image coordiate
			,prv.canvas.width,prv.canvas.height //image size
		);

		prv.ground.update(context,drawStart,diff);
		prv.ground2.update(context,drawStart,diff);
		prv.character.update(context,drawStart,diff);
	}

	/**
	 *
	 * @return Ground
	 */
	pub.getGround=function(){
		return prv.ground;
	}

	/**
	 *
	 * @return Ground
	 */
	pub.getGround2=function(){
		return prv.ground2;
	}

	prv.init();
}



var g=new Game();

