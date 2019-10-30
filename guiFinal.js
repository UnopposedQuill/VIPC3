let superiorOculta,superiorLateral= false;

function ocultarSuperior(){

	var componente = document.getElementById("divicion1");
	
	if(superiorOculta){
		componente.style.visibility='visible';
		componente.style.height="110px";
		document.getElementById("btnSuperior").innerHTML = "^";
		document.getElementById("contenedorCanvas").style.height= "calc(100% - 155px)";	
		document.getElementById("divicion3").style.height= "calc(100% - 155px)";
		document.getElementById("divicion4").style.height= "calc(100% - 155px)";	
	}
	else{
		componente.style.visibility='hidden';
		componente.style.height="0px";
		document.getElementById("btnSuperior").innerHTML = "v";
		document.getElementById("contenedorCanvas").style.height= "calc(100% - 40px)";
		document.getElementById("divicion3").style.height= "calc(100% - 40px)";
		document.getElementById("divicion4").style.height= "calc(100% - 40px)";
	} 	

	superiorOculta=!superiorOculta;
}

function ocultarLateral(){

	var componente = document.getElementById("divicion4");
	
	if(superiorLateral){
		componente.style.width="calc(20% - 50px)";
		componente.style.visibility='visible';
		document.getElementById("btnLateral").innerHTML = ">";
		document.getElementById("contenedorCanvas").style.width= "calc(83% - 45px)";		
	}
	else{
		componente.style.width="0px";
		componente.style.visibility='hidden';
		document.getElementById("btnLateral").innerHTML = "<";
		document.getElementById("contenedorCanvas").style.width= "calc(100% - 53px)";
	} 	

	superiorLateral=!superiorLateral;
}