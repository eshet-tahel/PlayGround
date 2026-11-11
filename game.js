import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js';
const canvas=document.querySelector('#scene'),renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=false;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x171326);scene.fog=new THREE.FogExp2(0x171326,.023);
const camera=new THREE.PerspectiveCamera(54,innerWidth/innerHeight,.1,180);scene.add(new THREE.HemisphereLight(0xb7a3d8,0x21182c,2.1));const moon=new THREE.DirectionalLight(0xe4d6ff,2.1);moon.position.set(-12,20,8);moon.castShadow=true;moon.shadow.mapSize.set(1024,1024);moon.shadow.camera.left=-28;moon.shadow.camera.right=28;moon.shadow.camera.top=30;moon.shadow.camera.bottom=-30;scene.add(moon);const warm=new THREE.PointLight(0xffbb75,28,30,2);warm.position.set(1,5,-23);scene.add(warm);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(120,150),new THREE.MeshStandardMaterial({color:0x272233,roughness:.96}));ground.rotation.x=-Math.PI/2;ground.position.set(0,-.12,-26);ground.receiveShadow=true;scene.add(ground);
const pathMat=new THREE.MeshStandardMaterial({color:0x51485b,roughness:.85});for(let i=0;i<33;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(5.3,.14,2.05),pathMat);m.position.set(0,-.02,13-i*2.15);m.receiveShadow=true;m.castShadow=true;scene.add(m);}const edgeMat=new THREE.MeshStandardMaterial({color:0x463c4d,roughness:1});for(const x of [-3.15,3.15]){const m=new THREE.Mesh(new THREE.BoxGeometry(.2,.3,73),edgeMat);m.position.set(x,.04,-23);m.receiveShadow=true;scene.add(m);}
const mats={bark:new THREE.MeshStandardMaterial({color:0x282132,roughness:1}),leaf:new THREE.MeshStandardMaterial({color:0x2d293b,roughness:1}),leaf2:new THREE.MeshStandardMaterial({color:0x40344b,roughness:1}),gold:new THREE.MeshStandardMaterial({color:0xd9b96f,metalness:.55,roughness:.35,emissive:0x69441a,emissiveIntensity:.3}),stone:new THREE.MeshStandardMaterial({color:0x51465d,roughness:.85}),castle:new THREE.MeshStandardMaterial({color:0x494257,roughness:.85}),roof:new THREE.MeshStandardMaterial({color:0x292335,roughness:.82}),glow:new THREE.MeshStandardMaterial({color:0xffd789,emissive:0xffa832,emissiveIntensity:2.6}),cloak:new THREE.MeshStandardMaterial({color:0x252a3c,roughness:.9}),skin:new THREE.MeshStandardMaterial({color:0xd4aa83,roughness:.75}),witch:new THREE.MeshStandardMaterial({color:0x49405c,roughness:.8}),zombie:new THREE.MeshStandardMaterial({color:0x59665a,roughness:1}),dark:new THREE.MeshStandardMaterial({color:0x2c2634,roughness:.9})};
function mesh(geo,mat,parent,x=0,y=0,z=0){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
const treeData=[];for(let i=0;i<50;i++)treeData.push({x:(i%2?1:-1)*(5.3+(i%4)*1.8),z:15-(i%25)*2.7,scale:.75+(i%5)*.12,variant:i%3});
function addTreeInstances(geometry,material,localTransform){const instances=new THREE.InstancedMesh(geometry,material,treeData.length);const root=new THREE.Matrix4(),local=new THREE.Matrix4(),matrix=new THREE.Matrix4(),position=new THREE.Vector3(),quaternion=new THREE.Quaternion(),scale=new THREE.Vector3();for(let i=0;i<treeData.length;i++){const tree=treeData[i];root.compose(new THREE.Vector3(tree.x,0,tree.z),new THREE.Quaternion(),new THREE.Vector3(tree.scale,tree.scale,tree.scale));const transform=localTransform(tree,i);position.set(...transform.position);quaternion.setFromEuler(new THREE.Euler(...transform.rotation));scale.set(1,1,1);local.compose(position,quaternion,scale);matrix.multiplyMatrices(root,local);instances.setMatrixAt(i,matrix);}instances.instanceMatrix.needsUpdate=true;instances.castShadow=true;instances.receiveShadow=true;scene.add(instances);}
addTreeInstances(new THREE.CylinderGeometry(.24,.48,5,7),mats.bark,()=>({position:[0,2.5,0],rotation:[0,0,0]}));
for(let layer=0;layer<3;layer++){const geometry=new THREE.ConeGeometry(1.6-layer*.25,3.3,7),material=layer%2?mats.leaf:mats.leaf2;addTreeInstances(geometry,material,tree=>({position:[0,4.2+layer*1.25,0],rotation:[0,tree.variant*.8+layer,0]}));}
const branchGeometry=new THREE.CylinderGeometry(.09,.17,2.3,6);for(let branch=0;branch<2;branch++)addTreeInstances(branchGeometry,mats.bark,()=>({position:[branch?-.8:.8,3.4,branch?-.4:.35],rotation:[branch?.15:-.2,0,branch?-.68:.68]}));
for(let i=0;i<13;i++){const side=i%2?1:-1,z=9-i*4.8;mesh(new THREE.CylinderGeometry(.11,.18,1.3,7),mats.stone,scene,side*3.9,.55,z);const lamp=mesh(new THREE.IcosahedronGeometry(.2,1),mats.glow,scene,side*3.9,1.32,z);lamp.scale.set(.8,1.2,.8);}
const castleGroup=new THREE.Group();castleGroup.position.set(0,0,-52);scene.add(castleGroup);mesh(new THREE.BoxGeometry(12,9,3),mats.castle,castleGroup,0,4.5,0);mesh(new THREE.BoxGeometry(4.4,6.8,.4),mats.roof,castleGroup,0,4.2,1.72);
function tower(x,z,height=12){mesh(new THREE.CylinderGeometry(1.45,1.75,height,9),mats.castle,castleGroup,x,height/2,z);mesh(new THREE.ConeGeometry(2.05,3.1,9),mats.roof,castleGroup,x,height+1.5,z);for(let k=-1;k<=1;k++)mesh(new THREE.BoxGeometry(.2,.9,.09),mats.glow,castleGroup,x+k*.55,4.2,z+1.56);}tower(-5.3,.1,12);tower(5.3,.1,12);tower(-3.9,-1.1,9);tower(3.9,-1.1,9);
const gate=new THREE.Group();castleGroup.add(gate);for(let x=-1.25;x<=1.26;x+=.5)mesh(new THREE.BoxGeometry(.08,3.6,.18),mats.gold,gate,x,1.8,2.2);mesh(new THREE.BoxGeometry(2.7,.1,.18),mats.gold,gate,0,3.55,2.2);mesh(new THREE.TorusGeometry(1.05,.08,8,28,Math.PI),mats.gold,castleGroup,0,3.45,2.18);const moonDisc=mesh(new THREE.SphereGeometry(3,24,16),new THREE.MeshBasicMaterial({color:0x8c74a5,transparent:true,opacity:.2}),scene,-13,15,-58);moonDisc.scale.set(1,1,.08);
const player=new THREE.Group();scene.add(player);player.position.set(0,0,8);mesh(new THREE.ConeGeometry(.63,1.75,7),mats.cloak,player,0,1.05,.04).rotation.x=.12;mesh(new THREE.SphereGeometry(.37,14,12),mats.skin,player,0,2.05,-.03);const hood=mesh(new THREE.ConeGeometry(.49,.8,7),mats.cloak,player,0,2.42,-.01);hood.rotation.x=.1;mesh(new THREE.BoxGeometry(.3,.12,.08),mats.gold,player,0,2.1,.3);const wand=new THREE.Group();wand.position.set(.49,1.34,-.03);player.add(wand);const wandStick=mesh(new THREE.CylinderGeometry(.035,.055,.92,7),mats.gold,wand,0,.42,0);wandStick.rotation.z=-.42;const wandGem=mesh(new THREE.OctahedronGeometry(.13),mats.glow,wand,.2,.83,0);const playerAura=new THREE.PointLight(0x9d8bff,1.4,4,2);playerAura.position.set(0,1.7,0);player.add(playerAura);

// Five guardians block the forest road. Every direct wand hit removes exactly 10 HP.
function makeEnemy(type,x,z,index){
 const group=new THREE.Group();scene.add(group);group.position.set(x,0,z);
 const bodyMat=type==='witch'?mats.witch:mats.zombie,faceMat=type==='witch'?mats.skin:mats.zombie;
 mesh(new THREE.ConeGeometry(.66,1.75,7),bodyMat,group,0,1.02,0);mesh(new THREE.SphereGeometry(.36,12,10),faceMat,group,0,2.04,0);
 if(type==='witch'){
  const hat=mesh(new THREE.ConeGeometry(.48,.95,7),mats.dark,group,0,2.66,0);hat.rotation.z=.12;mesh(new THREE.TorusGeometry(.35,.07,6,12),mats.dark,group,0,2.32,0);
  const staff=mesh(new THREE.CylinderGeometry(.035,.055,1.2,6),mats.gold,group,.55,1.15,0);staff.rotation.z=-.15;
  mesh(new THREE.OctahedronGeometry(.17),new THREE.MeshStandardMaterial({color:0xbf75ee,emissive:0x9d42e7,emissiveIntensity:1.6}),group,.58,1.82,0);
  for(const eyeX of [-.13,.13])mesh(new THREE.SphereGeometry(.045),new THREE.MeshBasicMaterial({color:0xe6a8ff}),group,eyeX,2.07,.31);
 }else{
  for(const eyeX of [-.12,.12])mesh(new THREE.BoxGeometry(.13,.1,.08),new THREE.MeshBasicMaterial({color:0xd8d56b}),group,eyeX,2.08,.32);
  const arm=mesh(new THREE.CylinderGeometry(.12,.15,.8,6),faceMat,group,.58,1.32,0);arm.rotation.z=-.7;
 }
 const bar=new THREE.Group();bar.position.set(0,3.35,0);group.add(bar);
 mesh(new THREE.BoxGeometry(1.35,.13,.06),new THREE.MeshBasicMaterial({color:0x19131f}),bar);
 const fill=mesh(new THREE.BoxGeometry(1.25,.075,.07),new THREE.MeshBasicMaterial({color:type==='witch'?0xcf8be9:0x9bcb83}),bar,0,0,.045);
 return {group,type,hp:100,alive:true,bar,fill,shot:1.2+Math.random()*1.7,baseX:x,baseZ:z,id:index};
}
const enemies=[makeEnemy('witch',-1.6,-7.8,0),makeEnemy('zombie',1.45,-14,1),makeEnemy('witch',1.65,-21,2),makeEnemy('zombie',-1.55,-28,3),makeEnemy('witch',.1,-35,4)];
let playerHealth=100,active=false,gameOver=false,remaining=enemies.length,elapsed=0,castCooldown=0,toastTimer=0;
const projectiles=[],clock=new THREE.Clock(),move={x:0,z:0},keys={};
const ui={health:document.querySelector('#health-value'),healthFill:document.querySelector('#health-fill'),foes:document.querySelector('#foe-label'),objective:document.querySelector('#objective-text'),toast:document.querySelector('#toast'),intro:document.querySelector('#intro'),victory:document.querySelector('#victory'),defeat:document.querySelector('#defeat')};
function notify(text){ui.toast.textContent=text;ui.toast.classList.add('show');toastTimer=2.1;}
function refreshHUD(){ui.health.textContent=playerHealth;ui.healthFill.style.width=playerHealth+'%';ui.healthFill.style.background=playerHealth<35?'linear-gradient(90deg,#9f334a,#f27e73)':'linear-gradient(90deg,#bd5165,#f1b58b)';ui.foes.textContent=remaining===0?'The way is open':remaining+' shadow'+(remaining===1?'':'s')+' remain';}
function fireBolt(origin,target,color,fromEnemy=false){
 const material=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:2.3,roughness:.2});
 const orb=mesh(new THREE.IcosahedronGeometry(fromEnemy?.14:.18,1),material,scene,origin.x,origin.y,origin.z);
 const light=new THREE.PointLight(color,fromEnemy?3:4,3,2);orb.add(light);
 const velocity=target.clone().sub(origin).normalize().multiplyScalar(fromEnemy?8.2:17);
 projectiles.push({mesh:orb,velocity,life:2.4,fromEnemy});
}
function cast(){
 if(!active||gameOver||castCooldown>0)return;castCooldown=.31;wandGem.scale.setScalar(1.5);setTimeout(()=>wandGem.scale.setScalar(1),100);
 let target=null,best=Infinity;for(const enemy of enemies){if(!enemy.alive)continue;const distance=player.position.distanceTo(enemy.group.position);if(distance<best){best=distance;target=enemy;}}
 const origin=wand.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,.27,-.28));
 const destination=target?target.group.position.clone().add(new THREE.Vector3(0,1.55,0)):origin.clone().add(new THREE.Vector3(0,.5,-18));
 fireBolt(origin,destination,0x9de8ff);
}
function enemyFire(enemy){const origin=enemy.group.position.clone().add(new THREE.Vector3(0,1.8,0));const aim=player.position.clone().add(new THREE.Vector3(0,1.5,0));fireBolt(origin,aim,enemy.type==='witch'?0xd47dff:0x9edc83,true);}
function damagePlayer(amount){playerHealth=Math.max(0,playerHealth-amount);refreshHUD();playerAura.intensity=4;setTimeout(()=>playerAura.intensity=1.4,140);notify('A shadow bolt strikes! −'+amount+' life');if(playerHealth<=0){active=false;gameOver=true;ui.defeat.classList.remove('hidden');}}
function damageEnemy(enemy,amount){if(!enemy.alive)return;enemy.hp=Math.max(0,enemy.hp-amount);enemy.fill.scale.x=enemy.hp/100;enemy.fill.position.x=-(1-enemy.hp/100)*.625;enemy.group.scale.set(1.07,1.07,1.07);setTimeout(()=>{if(enemy.alive)enemy.group.scale.set(1,1,1);},100);if(enemy.hp<=0){enemy.alive=false;enemy.group.visible=false;remaining--;refreshHUD();notify(enemy.type==='witch'?'The witch dissolves into starlight':'The restless dead fall still');if(remaining===0){ui.objective.textContent='The path is clear. Reach the castle';gate.visible=false;notify('The curse is broken. Find Shadowkeep!');}}
}
function resetGame(){for(const projectile of projectiles)scene.remove(projectile.mesh);projectiles.length=0;playerHealth=100;remaining=enemies.length;enemies.forEach(enemy=>{enemy.hp=100;enemy.alive=true;enemy.group.visible=true;enemy.group.position.set(enemy.baseX,0,enemy.baseZ);enemy.fill.scale.x=1;enemy.fill.position.x=0;enemy.shot=1+Math.random()*1.8;});player.position.set(0,0,8);camera.position.set(0,5.5,18.2);camera.lookAt(0,1.75,.5);gameOver=false;active=true;castCooldown=0;gate.visible=true;ui.objective.textContent='Find the path through the cursed wood';ui.intro.classList.add('hidden');ui.victory.classList.add('hidden');ui.defeat.classList.add('hidden');refreshHUD();notify('The veil stirs. Your wand is ready.');}
function update(dt){
 elapsed+=dt;if(!active)return;castCooldown=Math.max(0,castCooldown-dt);if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)ui.toast.classList.remove('show');}
 let ix=move.x,iz=move.z;if(keys.KeyA||keys.ArrowLeft)ix-=1;if(keys.KeyD||keys.ArrowRight)ix+=1;if(keys.KeyW||keys.ArrowUp)iz-=1;if(keys.KeyS||keys.ArrowDown)iz+=1;
 const inputLength=Math.hypot(ix,iz);if(inputLength>1){ix/=inputLength;iz/=inputLength;}const speed=keys.ShiftLeft||keys.ShiftRight?8.2:5.4;
 player.position.x=THREE.MathUtils.clamp(player.position.x+ix*speed*dt,-2.15,2.15);player.position.z=THREE.MathUtils.clamp(player.position.z+iz*speed*dt,-46,13);player.rotation.y=ix*.2;
 const walking=inputLength>.05;player.position.y=walking?Math.abs(Math.sin(elapsed*10))*.045:Math.sin(elapsed*2)*.018;wand.rotation.z=walking?Math.sin(elapsed*8)*.055:Math.sin(elapsed*2.7)*.035;
 for(const enemy of enemies){if(!enemy.alive)continue;enemy.bar.quaternion.copy(camera.quaternion);enemy.group.position.x=enemy.baseX+Math.sin(elapsed*1.1+enemy.id)*.17;enemy.group.position.y=Math.sin(elapsed*2+enemy.id)*.035;enemy.shot-=dt;if(enemy.shot<=0&&player.position.distanceTo(enemy.group.position)<23){enemyFire(enemy);enemy.shot=(enemy.type==='witch'?2.4:3.3)+Math.random()*1.25;}}
 for(let i=projectiles.length-1;i>=0;i--){const projectile=projectiles[i];projectile.life-=dt;projectile.mesh.position.addScaledVector(projectile.velocity,dt);
  if(projectile.fromEnemy){if(projectile.mesh.position.distanceTo(player.position.clone().add(new THREE.Vector3(0,1.3,0)))<.9){scene.remove(projectile.mesh);projectiles.splice(i,1);damagePlayer(10);continue;}}
  else{let hit=false;for(const enemy of enemies){if(!enemy.alive)continue;const center=enemy.group.position.clone().add(new THREE.Vector3(0,1.55,0));if(projectile.mesh.position.distanceTo(center)<.9){damageEnemy(enemy,10);hit=true;break;}}if(hit){scene.remove(projectile.mesh);projectiles.splice(i,1);continue;}}
  if(projectile.life<=0||Math.abs(projectile.mesh.position.x)>30||projectile.mesh.position.z<-65||projectile.mesh.position.z>20){scene.remove(projectile.mesh);projectiles.splice(i,1);}
 }
 const desired=new THREE.Vector3(player.position.x*.48,5.5,player.position.z+10.2);camera.position.lerp(desired,1-Math.exp(-dt*2.8));camera.lookAt(new THREE.Vector3(player.position.x*.32,1.75,player.position.z-7.5));
 if(remaining===0&&player.position.z<-44){active=false;ui.victory.classList.remove('hidden');ui.objective.textContent='Shadowkeep is yours';}
}
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);update(dt);renderer.render(scene,camera);}animate();
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));}window.addEventListener('resize',resize);
window.addEventListener('keydown',event=>{keys[event.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.code))event.preventDefault();if(event.code==='Space'&&!event.repeat)cast();});window.addEventListener('keyup',event=>{keys[event.code]=false;});canvas.addEventListener('pointerdown',event=>{if(active&&event.button===0)cast();});
document.querySelector('#start-button').addEventListener('click',resetGame);document.querySelector('#replay-button').addEventListener('click',resetGame);document.querySelector('#retry-button').addEventListener('click',resetGame);document.querySelector('#cast-button').addEventListener('pointerdown',event=>{event.preventDefault();cast();});
const joystick=document.querySelector('#joystick'),knob=document.querySelector('#joy-knob');let joystickPointer=null;
joystick.addEventListener('pointerdown',event=>{event.preventDefault();joystickPointer=event.pointerId;joystick.setPointerCapture(joystickPointer);setStick(event);});
joystick.addEventListener('pointermove',event=>{if(event.pointerId===joystickPointer)setStick(event);});
function releaseStick(event){if(event.pointerId!==joystickPointer)return;joystickPointer=null;move.x=0;move.z=0;knob.style.transform='translate(-50%,-50%)';}
joystick.addEventListener('pointerup',releaseStick);joystick.addEventListener('pointercancel',releaseStick);
function setStick(event){const rect=joystick.getBoundingClientRect(),dx=event.clientX-(rect.left+rect.width/2),dy=event.clientY-(rect.top+rect.height/2),max=rect.width*.31,length=Math.hypot(dx,dy),scale=length>max?max/length:1,x=dx*scale,y=dy*scale;knob.style.transform=`translate(calc(-50% + ${x}px),calc(-50% + ${y}px))`;move.x=x/max;move.z=y/max;}
refreshHUD();
