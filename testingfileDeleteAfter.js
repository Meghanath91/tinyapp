
const emailLookUp = function(email){
  
  let existEmail = users.userid.email
   console.log(existEmail)
  for(let email of existEmail) {
 
     for(let existingProperty in userid){
 
       if(email === users.userid.existingProperty){
         return true;
       }
       
 
     }
     return false;
   }
 };