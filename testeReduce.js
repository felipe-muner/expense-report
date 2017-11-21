var arr = [
  {nome:'felipe',idade:26},
  {nome:'jean',idade:20},
  {nome:'ailton',idade:40},
  {nome:'cr',idade:55},
]

var ele = arr.reduce((acc,ele)=>{
  if(26 === ele.idade){
    acc.push(ele)
  }
  return acc
},[])

console.log(ele);
