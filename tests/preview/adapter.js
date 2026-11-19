import { PAGE_SIZE } from "../../src/utils/constants.js";
import img1 from "../../src/data/cabins/cabin-001.jpg";
import img2 from "../../src/data/cabins/cabin-002.jpg";
import img3 from "../../src/data/cabins/cabin-003.jpg";
import img4 from "../../src/data/cabins/cabin-004.jpg";
import { cabinValues } from "../../src/services/validation.js";
const images = [img1,img2,img3,img4];
let cabins = images.map((image,index) => ({ id:index+1, name:`00${index+1}`, description:"A comfortable sample cabin surrounded by nature.", maxCapacity:index+2, regularPrice:200+index*100, discount:index%2?25:0, image }));
let settings = { id:1, minBookingLength:1, maxBookingLength:30, maxGuestsPerBooking:8, breakfastPrice:15 };
const day = (offset) => { const value=new Date(); value.setUTCDate(value.getUTCDate()+offset); value.setUTCHours(0,0,0,0);return value.toISOString(); };
let bookings = Array.from({length:18},(_,i) => ({ id:i+1, created_at:day(-i), startDate:day(i-6), endDate:day(i-3), numNights:3, numGuests:2, cabinPrice:600, extrasPrice:90, totalPrice:690, hasBreakfast:i%2===0, isPaid:i%3!==0, observations:"", status:["unconfirmed","checked-in","checked-out"][i%3], cabinId:i%4+1, guestId:i+1, cabins:cabins[i%4], guests:{ id:i+1, fullName:`Sample Guest ${i+1}`, email:`guest${i+1}@example.test`, nationality:"United Kingdom", nationalID:"SAMPLE", countryFlag:"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='16'%3E%3Cpath fill='%231f4f86' d='M0 0h24v16H0z'/%3E%3C/svg%3E" } }));
const sampleUser={ id:"offline-admin", role:"authenticated", email:"admin@example.test", app_metadata:{app_role:"admin"}, user_metadata:{fullName:"Alex Morgan",avatar:""} };
let user = {...sampleUser};
export async function getCurrentUser(){return user;}
export async function login(){user={...sampleUser};return {user};}
export async function logout(){user=null;}
export async function signup(){return {invited:true};}
export async function updateCurrentUser(values){user={...user,user_metadata:{...user.user_metadata,fullName:values.fullName||user.user_metadata.fullName}};return {user};}
export async function getCabins(){return cabins.map(c=>({...c}));}
export async function createEditCabin(values,id){const data=cabinValues(values); const image=values.image instanceof File?URL.createObjectURL(values.image):values.image;const row={...data,image,id:id||Math.max(0,...cabins.map(c=>c.id))+1};cabins=id?cabins.map(c=>c.id===id?row:c):[...cabins,row];return row;}
export async function deleteCabin(id){if(bookings.some(b=>b.cabinId===id))throw new Error("This cabin has sample bookings.");cabins=cabins.filter(c=>c.id!==id);}
export async function getSettings(){return {...settings};}
export async function updateSetting(values){if(values.minBookingLength>values.maxBookingLength)throw new Error("Minimum nights cannot exceed maximum nights.");settings={...settings,...values};return {...settings};}
export async function getBookings({filter,sortBy,page=1}){let data=bookings.filter(b=>!filter||b.status===filter.value);data=[...data].sort((a,b)=>(typeof a[sortBy?.field]==="string"?a[sortBy.field].localeCompare(b[sortBy.field]):a[sortBy?.field]-b[sortBy?.field])*(sortBy?.direction==="asc"?1:-1));return {data:data.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE),count:data.length};}
export async function getBooking(id){return bookings.find(b=>b.id===Number(id));}
export async function getBookingsAfterDate(date){return bookings.filter(b=>b.created_at>=date);}
export async function getStaysAfterDate(date){return bookings.filter(b=>b.startDate>=date&&b.startDate<=day(0));}
export async function getStaysTodayActivity(){return bookings.filter(b=>(b.status==="unconfirmed"&&b.startDate===day(0))||(b.status==="checked-in"&&b.endDate===day(0)));}
export async function updateBooking(id,values){bookings=bookings.map(b=>b.id===Number(id)?{...b,...values}:b);return getBooking(id);}
export async function deleteBooking(id){bookings=bookings.filter(b=>b.id!==Number(id));}
