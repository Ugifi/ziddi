// ── GAME TYPES ──
export const GAME_TYPES = [
  {id:'single_digit',      label:'SINGLE DIGIT',      icon:'single_digit', desc:'Pick 1 digit (0–9)',       win:'9×',  numType:'ank'},
  {id:'single_digit_bulk', label:'SINGLE DIGIT BULK', icon:'bulk',         desc:'Multiple digits at once',  win:'9×',  numType:'ank_bulk'},
  {id:'jodi_digit',        label:'JODI DIGIT',         icon:'jodi',         desc:'Pick 2-digit Jodi 00–99',  win:'90×', numType:'jodi'},
  {id:'jodi_bulk',         label:'JODI BULK',          icon:'bulk',         desc:'Multiple Jodi bets',       win:'90×', numType:'jodi_bulk'},
  {id:'single_pana',       label:'SINGLE PANA',        icon:'single_pana',  desc:'3-digit single pana',      win:'150×',numType:'pana'},
  {id:'single_pana_bulk',  label:'SINGLE PANA BULK',   icon:'bulk',         desc:'Multiple single pana',     win:'150×',numType:'pana_bulk'},
  {id:'double_pana',       label:'DOUBLE PANA',        icon:'double_pana',  desc:'3-digit double pana',      win:'300×',numType:'pana'},
  {id:'double_pana_bulk',  label:'DOUBLE PANA BULK',   icon:'bulk',         desc:'Multiple double pana',     win:'300×',numType:'pana_bulk'},
  {id:'triple_pana',       label:'TRIPLE PANA',        icon:'triple_pana',  desc:'Triple digit pana',        win:'600×',numType:'pana'},
  {id:'half_sangam_a',     label:'HALF SANGAM A',      icon:'half_sangam',  desc:'Open digit + close pana',  win:'1000×',numType:'sangam'},
  {id:'half_sangam_b',     label:'HALF SANGAM B',      icon:'half_sangam',  desc:'Open pana + close digit',  win:'1000×',numType:'sangam'},
  {id:'full_sangam',       label:'FULL SANGAM',        icon:'full_sangam',  desc:'Open pana + close pana',   win:'2000×',numType:'sangam'},
  {id:'odd_even',          label:'ODD / EVEN',         icon:'odd_even',     desc:'Bet on Odd or Even',        win:'2×',  numType:'oddeven'},
  {id:'dp_motor',          label:'DP MOTOR',           icon:'dp_motor',     desc:'Double Pana motor bet',     win:'300×',numType:'pana_bulk'},
  {id:'sp_motor',          label:'SP MOTOR',           icon:'sp_motor',     desc:'Single Pana motor bet',     win:'150×',numType:'pana_bulk'},
  {id:'red_jodi',          label:'RED JODI',           icon:'red_jodi',     desc:'Special red jodi bet',      win:'90×', numType:'jodi'},
  {id:'cycle_jodi',        label:'CYCLE JODI',         icon:'cycle_jodi',   desc:'All jodis with a digit',    win:'90×', numType:'jodi_bulk'},
  {id:'sp_dp_tp',          label:'SP DP TP',           icon:'sp_dp_tp',     desc:'SP/DP/TP combo',            win:'150×',numType:'pana'},
  {id:'two_digit_pana',    label:'TWO DIGIT PANA',     icon:'two_digit_pana',desc:'2-digit + pana combo',    win:'300×',numType:'sangam'},
  {id:'digit_jodi',        label:'DIGIT JODI',         icon:'digit_jodi',   desc:'Jodis on open/close side', win:'90×', numType:'jodi_bulk'},
  {id:'sp_common',         label:'SP COMMON',          icon:'sp_common',    desc:'Single pana common',        win:'150×',numType:'pana_bulk'},
  {id:'dp_common',         label:'DP COMMON',          icon:'dp_common',    desc:'Double pana common',        win:'300×',numType:'pana_bulk'},
];

// ── GAMES ──
export const GAMES = [
  {id:1,name:'Kalyan Morning',   icon:'☀️', time:'10:00 AM – 11:00 AM', open:true,  result:'2-56-8'},
  {id:2,name:'Milan Day',        icon:'🏙️', time:'01:00 PM – 02:00 PM', open:true,  result:'4-78-3'},
  {id:3,name:'Rajdhani Day',     icon:'👑', time:'03:15 PM – 05:15 PM', open:false, result:'1-29-6'},
  {id:4,name:'Kalyan',           icon:'🎯', time:'04:10 PM – 06:10 PM', open:true,  result:'7-45-2'},
  {id:5,name:'Main Bazar',       icon:'🏪', time:'09:30 PM – 12:00 AM', open:false, result:'3-67-9'},
  {id:6,name:'Milan Night',      icon:'🌙', time:'09:00 PM – 10:00 PM', open:true,  result:'5-12-8'},
  {id:7,name:'Rajdhani Night',   icon:'🌟', time:'09:30 PM – 11:30 PM', open:false, result:'6-34-1'},
  {id:8,name:'Supreme Day',      icon:'💎', time:'02:00 PM – 04:00 PM', open:true,  result:'8-90-7'},
  {id:9,name:'Time Bazar',       icon:'⏰', time:'01:00 PM – 02:00 PM', open:false, result:'0-33-5'},
  {id:10,name:'Madhur Day',      icon:'🎪', time:'11:30 AM – 12:30 PM', open:true,  result:'9-11-2'},
  {id:11,name:'Sridevi',         icon:'🎭', time:'11:30 AM – 12:30 PM', open:false, result:'5-77-4'},
  {id:12,name:'Madhur Night',    icon:'🌌', time:'08:30 PM – 10:30 PM', open:true,  result:'2-44-6'},
];

export const QUICK_GAMES = [
  {id:1, name:'Starline'},
  {id:2, name:'Disawar'},
];

// ── INITIAL BIDS ──
export const INIT_BIDS = [
  {id:1,game:'Kalyan',number:'42',amount:500,type:'JODI DIGIT',status:'win',date:'Today 4:30 PM',winAmt:45000},
  {id:2,game:'Main Bazar',number:'7',amount:200,type:'SINGLE DIGIT',status:'loss',date:'Today 2:00 PM',winAmt:0},
  {id:3,game:'Milan Day',number:'128',amount:1000,type:'SINGLE PANA',status:'pending',date:'Today 1:45 PM',winAmt:0},
  {id:4,game:'Rajdhani Day',number:'55',amount:300,type:'JODI DIGIT',status:'win',date:'Yesterday',winAmt:27000},
];

// ── INITIAL TRANSACTIONS ──
export const INIT_TXNS = [
  {id:1,type:'credit',name:'Add Funds',date:'Today, 10:30 AM',ref:'#MK8291AB',amt:2000,statusTxt:'SUCCESS'},
  {id:2,type:'debit',name:'Bid — Kalyan',date:'Today, 4:25 PM',ref:'#BID7734',amt:500,statusTxt:'PENDING'},
  {id:3,type:'credit',name:'Win — Kalyan',date:'Today, 4:31 PM',ref:'#WIN4521',amt:45000,statusTxt:'SUCCESS'},
  {id:4,type:'debit',name:'Withdrawal',date:'Yesterday',ref:'#WD9981',amt:5000,statusTxt:'PENDING'},
  {id:5,type:'debit',name:'Bid — Main Bazar',date:'Yesterday',ref:'#BID4422',amt:200,statusTxt:'SUCCESS'},
];

// ── PANA LISTS ──
export const SINGLE_PANAS = ['128','137','146','236','245','290','380','470','489','560','579','012','013','014','015','016','017','018','019','023','024','025','026','027','028','029','034','035','036','037','038','039','045','046','047','048','049','056','057','058','059','067','068','069','078','079','089','123','124','125','126','127','129','134','135','136','138','139','145','147','148','149','156','157','158','159','167','168','169','178','179','189','234','235','237','238','239','246','247','248','249','256','257','258','259','267','268','269','278','279','289','345','346','347','348','349','356','357','358','359','367','368','369','378','379','389','456','457','458','459','467','468','469','478','479','489','567','568','569','578','579','589','678','679','689','789'];
export const DOUBLE_PANAS = ['100','200','300','400','500','600','700','800','900','110','220','330','440','550','660','770','880','990','112','113','114','115','116','117','118','119','122','223','224','225','226','227','228','229','133','233','334','335','336','337','338','339','144','244','344','445','446','447','448','449','155','255','355','455','556','557','558','559','166','266','366','466','566','667','668','669','177','277','377','477','577','677','778','779','188','288','388','488','588','688','788','889','199','299','399','499','599','699','799','899'];
export const TRIPLE_PANAS = ['000','111','222','333','444','555','666','777','888','999'];

// ── MARQUEE TEXT ──
export const MARQUEE_TEXT = 'Welcome To World Best Online Matka Play App - Play Win and Enjoy!';