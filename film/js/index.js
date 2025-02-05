function inside(sub,complete){ return(complete.substr(0,sub.length) == sub) }
function rdm(max) {return (Math.floor(Math.random()*max))}

var
	ctrl = false, alt = false,
	content = document.getElementById("contentFrame"),
	sidenav = document.getElementById("sidenav");

window.addEventListener("resize",sidenavResizing)
function sidenavResizing() {
	// sidenav.style.height = (window.innerHeight)+"px";
}
function init() {
	sidenavResizing()
	$(".item").on("click",function(){
		$(".active").removeClass("active");
		$(this).addClass("active");
	});	
    $(document).ready(function(){
	   	$('[data-toggle="tooltip"]').tooltip(); 
	});
	document.addEventListener("keydown",function(e){
		switch (e.keyCode) {
			// default: console.log(e.keyCode + " down");
		}		
	})
	document.addEventListener("keyup",function(e){
		switch (e.keyCode) {
			// default: console.log(e.keyCode + " up");
		}
	})
}