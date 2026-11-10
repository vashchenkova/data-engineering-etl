// ============================================================
//  Онлайн-учебник Data Engineering ETL - приложение
// ============================================================
(function () {
  "use strict";

  var COURSE = window.COURSE;
  var LESSONS = [].concat(
    window.LESSONS_PART1 || [], window.LESSONS_PART2 || [], window.LESSONS_PART3 || []
  ).sort(function (a, b) { return a.num - b.num; });
  var PALETTE = window.PALETTE;
  var app = document.getElementById("app");
  var topnav = document.getElementById("topnav");

  // ---------- SVG-иллюстрации ----------
  // Палитра: серый / чёрный / неоновый зелёный #39ff14
  var C = {
    a: "#39ff14", a2: "#26262b", blue: "#242428", sky: "#2e2e34", green: "#39ff14",
    orange: "#232327", amber: "#26262b", red: "#d92d20", teal: "#26262b",
    ink: "#17181a", muted: "#5f6068", line: "#2c2c31", soft: "rgba(57,255,20,.14)",
    okSoft: "rgba(57,255,20,.18)", badSoft: "rgba(217,45,32,.10)", warnSoft: "rgba(57,255,20,.14)", bg: "#f1f1f3",
    warn: "#39ff14", wg: "#0f8a02"
  };
  function box(x, y, w, h, fill, rx) { return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+(rx||12)+'" fill="'+fill+'"/>'; }
  function txt(x, y, s, size, color, weight, anchor) {
    return '<text x="'+x+'" y="'+y+'" font-size="'+size+'" fill="'+color+'" text-anchor="'+(anchor||"middle")+'" font-weight="'+(weight||600)+'" font-family="Segoe UI,system-ui,sans-serif">'+s+'</text>';
  }
  function arrow(x1, y1, x2, y2, color, w) {
    return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+(color||"#0f8a02")+'" stroke-width="'+(w||2.5)+'" marker-end="url(#arw)"/>';
  }
  function hexagon(cx, cy, r, fill, label, sub) {
    var pts = [], i;
    for (i = 0; i < 6; i++) {
      var an = Math.PI/6 + i * Math.PI/3;
      pts.push((cx + r*Math.cos(an)).toFixed(1) + "," + (cy + r*Math.sin(an)).toFixed(1));
    }
    var tcol = (fill && fill.indexOf("#39ff14") === 0) ? "#0d0d0d" : "#ececec";
    return '<polygon points="'+pts.join(" ")+'" fill="'+fill+'"/>'+
      txt(cx, cy - 2, label, 11, tcol, 800) + txt(cx, cy + 14, sub, 9, tcol === "#0d0d0d" ? "rgba(13,13,13,.7)" : "rgba(236,236,236,.7)");
  }

  function kcard(x, y, w, h, barColor, title, lines) {
    var out = box(x, y, w, h, '#f1f1f3', 12)+
      '<rect x="'+x+'" y="'+y+'" width="6" height="'+h+'" rx="3" fill="'+barColor+'"/>'+
      txt(x + 22, y + 32, title, 15, barColor, 800, "start");
    for (var i = 0; i < lines.length; i++) {
      out += txt(x + 22, y + 58 + i * 25, "• " + lines[i], 12.5, C.ink, 600, "start");
    }
    return out;
  }
  function pbox(x, y, label, neon) {
    var fill = neon ? '#39ff14' : '#f1f1f3';
    var tcol = neon ? '#0d0d0d' : C.ink;
    return box(x, y, 150, 54, fill, 12)+txt(x + 75, y + 33, label, 13, tcol, 700);
  }

  function mcard(x, y, name, sub) {
    return box(x, y, 240, 86, '#f1f1f3', 12)+
      '<rect x="'+x+'" y="'+y+'" width="6" height="86" rx="3" fill="#39ff14"/>'+
      txt(x + 24, y + 36, name, 15.5, '#0f8a02', 800, "start")+
      txt(x + 24, y + 62, sub, 12.5, C.muted, 600, "start");
  }

  // ---------- Иконки (SVG вместо смайлов) ----------
  var ICONS = {
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M20 20H2" stroke-linecap="round"/>',
    target: '<circle cx="11" cy="11" r="8"/><circle cx="11" cy="11" r="3.5"/><circle cx="11" cy="11" r="0.5" fill="currentColor"/>',
    lock: '<rect x="4" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a3 3 0 0 1 6 0v3"/>',
    flask: '<path d="M9 3h6M10 3v6l5 9a2 2 0 0 1-1.8 3H7.8A2 2 0 0 1 6 18l5-9V3"/><path d="M8 14h6"/>',
    pencil: '<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1z"/><path d="M14 6l4 4"/>',
    check: '<path d="M3 12l6 6L21 5" stroke-linecap="round" stroke-linejoin="round"/>',
    cross: '<path d="M5 5l12 12M17 5L5 17" stroke-linecap="round"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 6.3"/><path d="M20 5v6h-6" stroke-linejoin="round"/>',
    download: '<path d="M11 3v10M6 8l5 5 5-5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
    file: '<path d="M6 2h7l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/><path d="M13 2v6h6"/>',
    trophy: '<path d="M7 4h10v4a5 5 0 0 1-10 0V4z"/><path d="M7 5H4a3 3 0 0 0 3 5M15 5h3a3 3 0 0 1-3 5M11 13v4M8 20h6"/>',
    bulb: '<path d="M9 18h6M10 21h2"/><path d="M11 3a6 6 0 0 1 4 10.5c-.8.7-1 1.5-1 2.5h-6c0-1-.2-1.8-1-2.5A6 6 0 0 1 11 3z"/>',
    warn: '<path d="M12 3L2 20h20L12 3z" stroke-linejoin="round"/><path d="M12 10v4M12 17h.01" stroke-linecap="round"/>',
    link: '<path d="M9 15l6-6"/><path d="M11 6l1.5-1.5a4 4 0 0 1 6 6L17 12M13 16l-1.5 1.5a4 4 0 0 1-6-6L7 10"/>',
    db: '<ellipse cx="11" cy="5" rx="7" ry="2.5"/><path d="M4 5v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V5"/><path d="M4 11c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5"/>'
  };
  function icon(name, size) {
    var s = size || 17;
    return '<svg class="ic" width="'+s+'" height="'+s+'" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">'+ICONS[name]+'</svg>';
  }
  var DEFS = '<defs><marker id="arw" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#0f8a02"/></marker></defs>';

  window.ILLUS = {

    // ---------- Урок 1 ----------
    l1_etl: '<svg viewBox="0 0 820 300">'+DEFS+
      box(20,30,170,54,'#f1f1f3')+'<rect x="20" y="30" width="6" height="54" rx="3" fill="'+C.blue+'"/>'+txt(110,52,"PostgreSQL",14,C.ink)+txt(110,72,"заказы",11.5,C.muted)+
      box(20,120,170,54,'#f1f1f3')+'<rect x="20" y="120" width="6" height="54" rx="3" fill="'+C.green+'"/>'+txt(110,142,"Google Analytics",13.5,C.ink)+txt(110,162,"клики",11.5,C.muted)+
      box(20,210,170,54,'#f1f1f3')+'<rect x="20" y="210" width="6" height="54" rx="3" fill="'+C.orange+'"/>'+txt(110,232,"CSV / логи / Excel",13.5,C.ink)+txt(110,252,"логи и ручные данные",11.5,C.muted)+
      arrow(195,57,260,140)+arrow(195,147,260,147)+arrow(195,237,260,160)+
      box(265,105,190,88,C.a,14)+txt(360,142,"ETL-ПАЙПЛАЙН",14.5,'#0d0d0d',700)+txt(360,164,"Extract → Transform",12,'#124d08')+
      arrow(460,147,520,147)+
      box(525,105,120,88,'#f1f1f3',14)+txt(585,142,"DWH",17,'#17181a',800)+txt(585,164,"хранилище",11.5,'#5f6068')+
      arrow(650,127,710,90)+arrow(650,167,710,205)+
      box(705,58,100,62,C.okSoft)+txt(755,85,"Витрина",12.5,C.ink)+txt(755,103,"BI",12.5,C.muted)+
      box(705,182,100,62,C.warnSoft)+txt(755,209,"Витрина",12.5,C.ink)+txt(755,227,"ML",12.5,C.muted)+
      txt(410,280,"Данные из разных систем объединяются в одном хранилище и отдаются бизнесу",12.5,C.muted,500)+
      '</svg>',

    l1_stages: '<svg viewBox="0 0 820 250">'+DEFS+
      box(30,55,220,110,'#f1f1f3',14)+'<rect x="30" y="55" width="220" height="40" rx="14" fill="'+C.blue+'"/><rect x="30" y="80" width="220" height="15" fill="'+C.blue+'"/>'+txt(140,81,"1. EXTRACT",15,'#17181a',800)+
      txt(140,120,"SQL-запросы, API,",12.5,C.ink,500)+txt(140,140,"чтение файлов",12.5,C.ink,500)+
      arrow(255,110,290,110)+
      box(295,55,220,110,'#f1f1f3',14)+'<rect x="295" y="55" width="220" height="40" rx="14" fill="'+C.amber+'"/><rect x="295" y="80" width="220" height="15" fill="'+C.amber+'"/>'+txt(405,81,"2. TRANSFORM",15,'#17181a',800)+
      txt(405,118,"очистка · обогащение",12.5,C.ink,500)+txt(405,138,"валидация",12.5,C.ink,500)+
      arrow(520,110,555,110)+
      box(560,55,220,110,'#f1f1f3',14)+'<rect x="560" y="55" width="220" height="40" rx="14" fill="'+C.green+'"/><rect x="560" y="80" width="220" height="15" fill="'+C.green+'"/>'+txt(670,81,"3. LOAD",15,'#17181a',800)+
      txt(670,120,"полная · инкрементальная ·",12.5,C.ink,500)+txt(670,140,"дельта | Append · Merge",12.5,C.ink,500)+
      txt(410,215,"Режимы загрузки: полная, инкрементальная, дельта. Стратегии: Append, Truncate-and-Insert, Merge (Upsert)",12.5,C.muted,500)+
      '</svg>',

    l1_batch_stream: '<svg viewBox="0 0 820 300">'+DEFS+
      txt(210,36,"BATCHING - пакетно",15,C.ink,700)+
      box(30,60,140,42,C.blue)+txt(100,86,"день 1",13,'#fff',700)+
      box(190,60,140,42,C.blue)+txt(260,86,"день 2",13,'#fff',700)+
      box(350,60,140,42,C.blue)+txt(420,86,"день 3",13,'#fff',700)+
      arrow(475,81,530,81,C.wg)+box(535,55,200,52,'#f1f1f3',14)+txt(635,86,"обработка",13.5,'#17181a',700)+
      txt(370,145,"срезы за период: минута / час / день · отчёты к сроку",12,C.muted,500)+
      txt(210,190,"STREAMING - поток",15,C.ink,700)+
      '<circle cx="60" cy="225" r="7" fill="'+C.sky+'"/><circle cx="110" cy="225" r="7" fill="'+C.sky+'"/><circle cx="160" cy="225" r="7" fill="'+C.sky+'"/><circle cx="210" cy="225" r="7" fill="'+C.sky+'"/><circle cx="260" cy="225" r="7" fill="'+C.sky+'"/><circle cx="310" cy="225" r="7" fill="'+C.sky+'"/><circle cx="360" cy="225" r="7" fill="'+C.sky+'"/><circle cx="410" cy="225" r="7" fill="'+C.sky+'"/><circle cx="460" cy="225" r="7" fill="'+C.sky+'"/><circle cx="510" cy="225" r="7" fill="'+C.sky+'"/>'+
      arrow(530,225,585,225)+box(590,199,145,52,C.sky,14)+txt(662,225,"реальное время",13,'#fff',700)+
      txt(370,275,"непрерывный поток событий: мониторинг, фрод-детекция, рекомендации",12,C.muted,500)+
      '</svg>',

    // ---------- Урок 2 ----------
    l2_arch: '<svg viewBox="0 0 820 330">'+DEFS+
      box(30,30,180,70,'#f1f1f3')+txt(120,60,"Web Server",14.5,C.ink,700)+txt(120,80,"UI: логи, статусы",11.5,C.muted)+
      box(240,30,180,70,'#f1f1f3')+txt(330,60,"Scheduler",14.5,C.ink,700)+txt(330,80,"планировщик",11.5,C.muted)+
      box(450,30,180,70,'#f1f1f3')+txt(540,60,"Executor",14.5,C.ink,700)+txt(540,80,"исполнитель",11.5,C.muted)+
      box(30,140,180,70,C.a,12)+txt(120,170,"Metadata DB",14,'#0d0d0d',700)+txt(120,190,"PostgreSQL",11.5,'#124d08')+
      box(450,140,180,70,'#f1f1f3')+txt(540,170,"Worker 1 … Worker N",13,C.ink,700)+txt(540,190,"выполняют задачи",11.5,C.muted)+
      box(30,230,600,60,C.bg)+txt(330,266,"задачи, статусы, соединения, переменные, история запусков",12.5,C.muted)+
      arrow(210,65,235,65)+arrow(420,65,445,65)+arrow(540,105,540,135)+
      arrow(210,175,225,175,C.wg)+arrow(445,175,430,175,C.wg)+
      txt(410,320,"Scheduler читает DAG-файлы и ставит готовые задачи в очередь Executor → Worker",12.5,C.muted)+
      '</svg>',

    l2_dag: '<svg viewBox="0 0 820 240">'+DEFS+
      box(40,95,150,50,C.a)+txt(115,125,"extract",14,'#0d0d0d',700)+
      arrow(195,120,240,120)+
      box(245,95,150,50,C.a)+txt(320,125,"transform",14,'#0d0d0d',700)+
      arrow(400,110,450,70)+arrow(400,130,450,170)+
      box(455,45,150,50,C.blue)+txt(530,75,"load_bi",14,'#fff',700)+
      box(455,145,150,50,C.green)+txt(530,175,"load_ml",14,'#0d0d0d',700)+
      arrow(610,70,660,95)+arrow(610,170,660,145)+
      box(665,95,120,50,'#f1f1f3')+txt(725,125,"done",13.5,'#17181a',700)+
      txt(410,222,"extract >> transform >> [load_bi, load_ml] - направленный ациклический граф",12.5,C.muted)+
      '</svg>',

    l2_sensor: '<svg viewBox="0 0 820 250">'+DEFS+
      box(30,80,170,70,'#f1f1f3')+'<rect x="30" y="80" width="170" height="8" rx="4" fill="'+C.amber+'"/>'+txt(115,112,"FileSensor",14,C.ink,700)+txt(115,132,"ждёт data/in/*.csv",11.5,C.muted)+
      '<circle cx="215" cy="115" r="6" fill="'+C.amber+'"/><circle cx="228" cy="103" r="6" fill="'+C.amber+'"/><circle cx="241" cy="115" r="6" fill="'+C.amber+'"/>'+txt(228,145,"poke… poke…",11,C.muted)+
      arrow(260,115,300,115)+
      box(305,80,170,70,C.a)+txt(390,112,"extract.py",13.5,'#0d0d0d',700)+txt(390,132,"выполнена ✓",11.5,'#124d08')+
      arrow(480,105,530,85)+arrow(480,125,530,165)+
      box(535,55,110,50,'#f1f1f3')+txt(590,84,"XCom",12.5,C.ink,700)+txt(590,99,"n = 42",11,C.muted)+
      box(535,145,110,50,'#f1f1f3')+txt(590,174,"XCom",12.5,C.ink,700)+txt(590,189,"n = 42",11,C.muted)+
      arrow(650,80,700,110)+arrow(650,170,700,140)+
      box(705,85,85,50,C.bg)+txt(747,114,"task 2",12.5,C.ink,700)+
      box(705,145,85,50,C.bg)+txt(747,174,"task 3",12.5,C.ink,700)+
      txt(410,232,"Сенсор блокирует последующие задачи до True; XCom - «общая папка» запуска для малых данных",12.5,C.muted)+
      '</svg>',

    // ---------- Урок 3 ----------
    l3_trigger: '<svg viewBox="0 0 820 260">'+DEFS+
      box(40,100,160,50,C.a)+txt(120,130,"task 1",14,'#0d0d0d',700)+
      arrow(205,115,255,80)+arrow(205,135,255,180)+
      box(260,55,160,50,C.blue)+txt(340,84,"task 2 ✓",13.5,'#fff',700)+
      box(260,155,160,50,"rgba(255,92,92,.15)")+txt(340,184,"task 3 ✗",13.5,C.red,700)+
      arrow(425,80,480,115)+arrow(425,180,480,145)+
      box(485,105,180,50,C.amber)+txt(575,134,"cleanup  all_done",13,'#fff',700)+
      arrow(670,130,715,130)+
      box(718,105,72,50,'#f1f1f3')+txt(754,134,"✓",16,'#17181a',800)+
      txt(410,235,"cleanup запустится после обеих ветвей при любом статусе (trigger_rule = all_done)",12.5,C.muted)+
      '</svg>',

    // ---------- Урок 4 ----------
    l4_sources: '<svg viewBox="0 0 820 300">'+DEFS+
      txt(180,30,"Внутренние источники",13.5,C.ink,700)+
      box(30,45,150,44,'#f1f1f3')+txt(105,72,"ERP 1С / CRM",12.5,C.ink)+
      box(30,100,150,44,'#f1f1f3')+txt(105,127,"OLTP PostgreSQL",12.5,C.ink)+
      box(30,155,150,44,'#f1f1f3')+txt(105,182,"логи, S3, Hadoop",12.5,C.ink)+
      txt(180,30,"",12,C.muted)+
      txt(480,30,"Внешние источники",13.5,C.ink,700)+
      box(330,45,150,44,'#f1f1f3')+txt(405,72,"публичные API",12.5,C.ink)+
      box(330,100,150,44,'#f1f1f3')+txt(405,127,"веб-скрапинг",12.5,C.ink)+
      box(330,155,150,44,'#f1f1f3')+txt(405,182,"FTP партнёров",12.5,C.ink)+
      txt(650,30,"Типы данных",13.5,C.ink,700)+
      box(630,45,160,44,C.soft)+txt(710,72,"структурированные",12,'#0f8a02',700)+
      box(630,100,160,44,C.soft)+txt(710,127,"полуструктурированные",11.5,'#0f8a02',700)+
      box(630,155,160,44,C.soft)+txt(710,182,"неструктурированные",11.5,'#0f8a02',700)+
      arrow(180,110,230,140)+arrow(480,110,530,140)+arrow(600,105,660,90)+
      box(235,120,290,90,C.a,14)+txt(380,155,"Извлечение и подключение",13.5,'#0d0d0d',700)+txt(380,177,"SQL · API · файлы · парсеры",11.5,'#124d08')+
      arrow(530,165,585,165)+
      box(590,120,200,90,'#f1f1f3',14)+txt(690,155,"DWH",15,'#17181a',800)+txt(690,177,"и витрины данных",11.5,'#5f6068')+
      txt(410,272,"Ключевые вопросы: где данные? качество? частота обновления? объём? правовые ограничения?",12.5,C.muted)+
      '</svg>',

    l4_idem: '<svg viewBox="0 0 820 250">'+DEFS+
      box(30,90,180,70,'#f1f1f3')+txt(120,120,"calls_20260101.csv",12.5,C.ink,700)+txt(120,140,"данные за 01.01.2026",11,C.muted)+
      arrow(215,125,255,125)+
      box(260,90,190,70,C.warnSoft)+'<rect x="260" y="90" width="190" height="70" rx="12" fill="none" stroke="'+C.amber+'" stroke-width="2"/>'+txt(355,120,"DELETE за 01.01",13,C.warn,700)+txt(355,140,"очистка от дублей",11,C.muted)+
      arrow(455,125,495,125)+
      box(500,90,180,70,C.okSoft)+'<rect x="500" y="90" width="180" height="70" rx="12" fill="none" stroke="'+C.wg+'" stroke-width="2"/>'+txt(590,120,"INSERT строк",13,'#0f8a02',700)+
      arrow(685,125,725,125)+
      box(728,90,62,70,C.bg)+txt(759,130,"БД",14,C.ink,800)+
      '<circle cx="760" cy="45" r="24" fill="'+C.okSoft+'"/>'+txt(760,52,"↻",20,'#0f8a02',800)+
      txt(760,225,"Повторный запуск пайплайна безопасен: сначала очистка за дату файла, потом вставка",12.5,C.muted)+
      '</svg>',

    // ---------- Урок 5 ----------
    l5_broker: '<svg viewBox="0 0 820 300">'+DEFS+
      txt(190,30,"Прямая интеграция - хрупко",13.5,C.red,700)+
      box(80,50,150,46,'#f1f1f3')+'<rect x="80" y="50" width="4" height="46" fill="'+C.red+'"/>'+txt(155,78,"Сервис-источник",12,C.ink)+
      '<line x1="235" y1="60" x2="320" y2="60" stroke="'+C.red+'" stroke-width="2" stroke-dasharray="5 4"/>'+'<line x1="235" y1="80" x2="320" y2="85" stroke="'+C.red+'" stroke-width="2" stroke-dasharray="5 4"/>'+'<line x1="235" y1="90" x2="320" y2="110" stroke="'+C.red+'" stroke-width="2" stroke-dasharray="5 4"/>'+
      box(325,42,120,36,'#f1f1f3')+'<rect x="325" y="42" width="4" height="36" fill="'+C.red+'"/>'+txt(385,64,"Приёмник 1",11.5,C.ink)+
      box(325,90,120,36,'#f1f1f3')+'<rect x="325" y="90" width="4" height="36" fill="'+C.red+'"/>'+txt(385,112,"Приёмник 2 ✗",11.5,C.red,700)+
      txt(240,150,"упал приёмник - событие потеряно",11.5,C.red,600)+
      txt(600,30,"Через брокер - надёжно",13.5,'#0f8a02',700)+
      box(450,190,120,40,C.a)+txt(510,215,"Producer",12.5,'#0d0d0d',700)+
      box(600,180,120,60,'#f1f1f3')+txt(660,207,"Kafka",13.5,'#17181a',800)+txt(660,224,"брокер",10.5,'#5f6068')+
      arrow(570,210,595,210)+
      '<line x1="725" y1="195" x2="760" y2="170" stroke="'+C.wg+'" stroke-width="2.5"/>'+'<line x1="725" y1="210" x2="760" y2="210" stroke="'+C.wg+'" stroke-width="2.5"/>'+'<line x1="725" y1="228" x2="760" y2="250" stroke="'+C.wg+'" stroke-width="2.5"/>'+
      box(763,150,52,32,'#f1f1f3')+txt(789,170,"C1",11.5,C.ink,700)+
      box(763,195,52,32,'#f1f1f3')+txt(789,215,"C2",11.5,C.ink,700)+
      box(763,240,52,32,'#f1f1f3')+txt(789,260,"C3",11.5,C.ink,700)+
      txt(600,120,"сообщения сохраняются,",11.5,'#0f8a02',600)+txt(600,136,"каждый читает в своём темпе",11.5,'#0f8a02',600)+
      txt(410,292,"Прямые связи - потеря при сбое и нагрузка при повторных отправках; брокер делает системы независимыми",12,C.muted)+
      '</svg>',

    l5_topic: '<svg viewBox="0 0 820 320">'+DEFS+
      box(30,60,180,46,C.bg)+txt(120,88,"Producer",13.5,C.ink,700)+
      arrow(215,82,265,82)+
      box(270,30,300,110,'#f1f1f3')+txt(420,55,"Topic: calls",13.5,C.ink,800)+
      box(290,68,125,26,C.blue)+txt(352,86,"Partition 1",11.5,'#fff',700)+
      box(290,100,125,26,C.a2)+txt(352,118,"Partition 2",11.5,'#fff',700)+
      box(430,68,120,26,C.blue)+txt(490,86,"Partition 3",11.5,'#fff',700)+
      box(430,100,120,26,C.a2)+txt(490,118,"Partition 4",11.5,'#fff',700)+
      txt(640,44,"offset: 0,1,2…",11.5,C.muted)+
      arrow(575,85,635,85)+arrow(575,113,635,113)+
      box(640,55,150,40,C.bg)+txt(715,80,"Consumer Gr. 1",12,C.ink,700)+
      box(640,95,150,40,C.bg)+txt(715,120,"Consumer Gr. 2",12,C.ink,700)+
      arrow(215,220,265,220)+
      box(270,190,300,90,'#f1f1f3')+txt(420,215,"Topic: orders",13.5,C.ink,800)+
      box(290,232,125,26,C.teal)+txt(352,250,"Partition 1",11.5,'#fff',700)+
      box(430,232,120,26,C.orange)+txt(490,250,"Partition 2",11.5,'#fff',700)+
      arrow(575,237,635,237)+
      box(640,215,150,40,C.bg)+txt(715,240,"Consumer Gr. 3",12,C.ink,700)+
      txt(410,305,"Producer пишет в партиции топика; группы потребителей читают независимо друг от друга",12.5,C.muted)+
      '</svg>',

    l5_repl: '<svg viewBox="0 0 820 260">'+DEFS+
      box(40,70,220,120,'#f1f1f3')+'<rect x="40" y="70" width="220" height="34" rx="12" fill="'+C.a+'"/><rect x="40" y="90" width="220" height="14" fill="'+C.a+'"/>'+txt(150,92,"Broker 1 - ЛИДЕР",13,'#17181a',800)+
      txt(150,132,"Partition 0 (лидер)",12.5,C.ink,600)+
      '<circle cx="150" cy="160" r="4" fill="'+C.wg+'"/><circle cx="165" cy="160" r="4" fill="'+C.a+'"/><circle cx="180" cy="160" r="4" fill="'+C.a+'"/>'+
      box(300,70,220,120,'#f1f1f3')+'<rect x="300" y="70" width="220" height="34" rx="12" fill="'+C.sky+'"/><rect x="300" y="90" width="220" height="14" fill="'+C.sky+'"/>'+txt(410,92,"Broker 2 - копия",13,'#17181a',800)+
      txt(410,132,"Partition 0 (реплика)",12.5,C.ink,600)+
      box(560,70,220,120,'#f1f1f3')+'<rect x="560" y="70" width="220" height="34" rx="12" fill="'+C.sky+'"/><rect x="560" y="90" width="220" height="14" fill="'+C.sky+'"/>'+txt(670,92,"Broker 3 - копия",13,'#17181a',800)+
      txt(670,132,"Partition 0 (реплика)",12.5,C.ink,600)+
      '<line x1="265" y1="110" x2="295" y2="110" stroke="'+C.muted+'" stroke-width="2" stroke-dasharray="4 3"/>'+'<line x1="525" y1="110" x2="555" y2="110" stroke="'+C.muted+'" stroke-width="2" stroke-dasharray="4 3"/>'+
      arrow(410,205,410,225,C.red)+box(310,225,200,0,'#f1f1f3')+
      txt(410,245,"При падении лидера одна из копий становится новым лидером (leader election)",12.5,C.muted)+
      '</svg>',

    // ---------- Урок 6 ----------
    l6_stack: '<svg viewBox="0 0 820 300">'+DEFS+
      box(230,30,90,40,C.bg)+txt(275,55,"Scala",12.5,C.ink,700)+
      box(330,30,90,40,C.bg)+txt(375,55,"Java",12.5,C.ink,700)+
      box(430,30,90,40,C.bg)+txt(475,55,"Python",12.5,C.ink,700)+
      box(530,30,90,40,C.bg)+txt(575,55,"R",12.5,C.ink,700)+
      arrow(410,75,410,95)+
      box(230,100,390,44,C.a)+txt(425,128,"Spark Core - память, задачи, кластер",13.5,'#0d0d0d',800)+
      box(230,160,92,44,'#f1f1f3')+txt(276,186,"SQL",12.5,'#0f8a02',800)+
      box(328,160,92,44,'#f1f1f3')+txt(374,186,"Streaming",11.5,'#0f8a02',800)+
      box(426,160,92,44,'#f1f1f3')+txt(472,186,"MLlib",12.5,'#0f8a02',800)+
      box(524,160,96,44,'#f1f1f3')+txt(572,186,"GraphX",12.5,'#0f8a02',800)+
      arrow(410,150,410,155)+
      box(230,225,390,44,C.bg)+txt(425,252,"Cluster Manager · Driver · Executors · Cache",12.5,C.muted,700)+
      '</svg>',

    l6_exec: '<svg viewBox="0 0 820 330">'+DEFS+
      box(40,40,170,60,'#f1f1f3')+txt(125,66,"Код приложения",12.5,C.ink,700)+txt(125,84,"(Python / JAR)",11,C.muted)+
      arrow(215,70,255,70)+
      box(260,40,180,60,C.a)+txt(350,66,"Driver",14,'#0d0d0d',800)+txt(350,84,"SparkSession",11,'#124d08')+
      arrow(445,70,485,70)+
      box(490,40,160,60,C.a2)+txt(570,66,"Cluster Manager",12.5,'#fff',800)+
      arrow(570,105,570,135)+
      box(200,140,190,110,'#f1f1f3')+txt(295,168,"Executor 1",13,C.ink,800)+
      box(220,180,150,26,C.soft)+txt(295,197,"Task → Partition",11,'#0f8a02',700)+
      box(220,212,150,26,C.warnSoft)+txt(295,229,"Cache (RAM)",11,C.warn,700)+
      box(430,140,190,110,'#f1f1f3')+txt(525,168,"Executor 2",13,C.ink,800)+
      box(450,180,150,26,C.soft)+txt(525,197,"Task → Partition",11,'#0f8a02',700)+
      box(450,212,150,26,C.warnSoft)+txt(525,229,"Cache (RAM)",11,C.warn,700)+
      arrow(485,80,330,135)+arrow(610,80,530,135)+
      arrow(295,255,240,290)+arrow(525,255,580,290)+
      box(160,290,500,30,C.okSoft)+txt(410,310,"Результаты собираются драйвером или уходят в хранилище",12,'#0f8a02',700)+
      '</svg>',

    l6_catalyst: '<svg viewBox="0 0 820 240">'+DEFS+
      box(30,80,140,60,'#f1f1f3')+txt(100,105,"Логический план",12,C.ink,700)+txt(100,124,"дерево операций",10.5,C.muted)+
      arrow(175,110,205,110)+
      box(210,80,140,60,'#f1f1f3')+txt(280,105,"Анализ",12,C.ink,700)+txt(280,124,"типы, столбцы",10.5,C.muted)+
      arrow(355,110,385,110)+
      box(390,80,150,60,C.soft)+txt(465,105,"Лог. оптимизация",11.5,'#0f8a02',800)+txt(465,124,"убрать лишние фильтры",10.5,C.muted)+
      arrow(545,110,575,110)+
      box(580,80,110,60,'#f1f1f3')+txt(635,105,"Физ. план",12,C.ink,700)+txt(635,124,"sort/broadcast",10.5,C.muted)+
      arrow(695,110,715,110)+
      box(718,80,72,60,C.a)+txt(754,116,"байт-код",11,'#0d0d0d',700)+
      txt(410,195,"Catalyst Optimizer: план → анализ → оптимизация → физический план → генерация кода",12.5,C.muted)+
      txt(410,220,"Результат: DataFrame выполняется быстрее RDD - колоночный формат и оптимизированный план",12,C.muted,500)+
      '</svg>',

    // ---------- Урок 7 ----------
    l7_lazy: '<svg viewBox="0 0 820 240">'+DEFS+
      txt(180,30,"ПЛАН (lazy) - строится и ждёт",13,C.muted,700)+
      box(50,50,130,44,'#f1f1f3')+txt(115,77,"map(x·x)",12.5,C.ink,700)+
      arrow(185,72,215,72)+
      box(220,50,130,44,'#f1f1f3')+txt(285,77,"filter(>10)",12.5,C.ink,700)+
      txt(370,77,"→ план в DAG…",12.5,C.muted)+
      txt(180,130,"ДЕЙСТВИЕ (eager) - запуск всего графа",13,'#0f8a02',700)+
      arrow(285,105,285,150,C.wg)+
      box(215,155,145,48,C.green)+txt(287,184,"collect()",13,'#0d0d0d',800)+
      arrow(365,179,410,179,C.wg)+
      box(415,155,150,48,C.bg)+txt(490,184,"[16, 25]",13,C.ink,800)+
      txt(640,80,"transformations:",12.5,C.ink,700)+
      txt(640,100,"map, filter, select,",12,C.muted)+
      txt(640,118,"join, distinct, union",12,C.muted)+
      txt(640,150,"actions:",12.5,C.ink,700)+
      txt(640,170,"count, collect, show,",12,C.muted)+
      txt(640,188,"save, take, reduce",12,C.muted)+
      txt(410,232,"Весь граф map() → filter() выполнился только в момент вызова collect()",12.5,C.muted)+
      '</svg>',

    l7_shuffle: '<svg viewBox="0 0 820 320">'+DEFS+
      txt(180,32,"Map-сторона",13,C.ink,800)+
      box(40,45,130,40,'#f1f1f3')+txt(105,70,"Partition A",11.5,C.ink,700)+
      box(40,95,130,40,'#f1f1f3')+txt(105,120,"Partition B",11.5,C.ink,700)+
      box(40,145,130,40,'#f1f1f3')+txt(105,170,"Partition C",11.5,C.ink,700)+
      txt(120,215,"сортировка по ключу,",11.5,C.muted)+txt(120,232,"запись на диск + индекс",11.5,C.muted)+
      arrow(175,105,255,105,C.amber)+
      box(260,85,130,40,C.warnSoft)+txt(325,110,"Shuffle write",12,C.warn,800)+
      arrow(395,105,445,105,C.red)+
      box(450,85,150,40,"rgba(255,92,92,.15)")+txt(525,110,"ПЕРЕДАЧА ПО СЕТИ",11.5,C.red,800)+
      arrow(605,105,655,105)+
      box(660,85,130,40,C.warnSoft)+txt(725,110,"Shuffle read",12,C.warn,800)+
      txt(725,150,"приём в память,",11.5,C.muted)+txt(725,167,"spill, reduce",11.5,C.muted)+
      txt(410,270,"Shuffle = диск I/O + сеть + сериализация - самая дорогая операция в распределённых вычислениях",12.5,C.muted)+
      txt(410,296,"Минимизация: фильтрация до shuffle · spark.sql.adaptive.enabled=true · broadcast join для малых таблиц",12,C.muted,500)+
      '</svg>',

    l7_groupby: '<svg viewBox="0 0 820 300">'+DEFS+
      txt(180,30,"ДО SHUFFLE - ключи разбросаны",12.5,C.ink,800)+
      box(30,45,290,36,'#f1f1f3')+txt(175,68,"Узел 1, P1: (A,1) (B,2)",11.5,C.ink)+
      box(30,90,290,36,'#f1f1f3')+txt(175,113,"Узел 1, P2: (C,3) (A,4)",11.5,C.ink)+
      box(30,135,290,36,'#f1f1f3')+txt(175,158,"Узел 2, P3: (B,5) (C,6)",11.5,C.ink)+
      box(30,180,290,36,'#f1f1f3')+txt(175,203,"Узел 2, P4: (A,7) (B,8)",11.5,C.ink)+
      arrow(325,130,395,130)+
      box(400,105,120,50,C.warnSoft)+txt(460,135,"SHUFFLE",13,C.warn,800)+
      arrow(525,130,595,130)+
      txt(690,30,"ПОСЛЕ - ключи собраны",12.5,C.ink,800)+
      box(600,45,190,36,C.okSoft)+txt(695,68,"P1: A → [1, 4, 7]",11.5,'#0f8a02',700)+
      box(600,90,190,36,C.okSoft)+txt(695,113,"P2: B → [2, 5, 8]",11.5,'#0f8a02',700)+
      box(600,135,190,36,C.okSoft)+txt(695,158,"P3: C → [3, 6]",11.5,'#0f8a02',700)+
      txt(410,250,"groupByKey(): все одинаковые ключи должны оказаться в одной партиции",12.5,C.muted)+
      txt(410,276,"Поэтому и нужен shuffle: данные физически перераспределяются между узлами",12,C.muted,500)+
      '</svg>',

    // ---------- Урок 8 ----------
    l8_metrics: '<svg viewBox="0 0 820 250">'+DEFS+
      mcard(20, 20, "Accuracy", "Точность")+
      mcard(290, 20, "Completeness", "Полнота")+
      mcard(560, 20, "Consistency", "Согласованность")+
      mcard(20, 130, "Timeliness", "Актуальность")+
      mcard(290, 130, "Validity", "Валидность")+
      mcard(560, 130, "Uniqueness", "Уникальность")+
      '</svg>',

    // ---------- Урок 9 ----------
    l9_stack: '<svg viewBox="0 0 820 260">'+DEFS+
      box(40,80,180,100,'#f1f1f3')+txt(130,115,"Apache Airflow",13.5,C.ink,800)+
      txt(130,138,"метрики: длительность,",11,C.muted)+txt(130,155,"успехи/падения, слоты",11,C.muted)+
      box(230,80,70,30,C.a)+txt(265,100,"exporter",10.5,'#0d0d0d',700)+
      arrow(225,130,290,130)+
      box(300,80,170,100,C.a2)+txt(385,120,"Prometheus",14,'#fff',800)+
      txt(385,145,"pull по HTTP",11,'#c9c9cf')+txt(385,162,"PromQL · TSDB",11,'#c9c9cf')+
      arrow(475,130,540,130)+
      box(545,80,170,100,'#f1f1f3')+txt(630,120,"Grafana",14,C.ink,800)+
      txt(630,145,"дашборды",11,C.muted)+txt(630,162,"визуализация",11,C.muted)+
      arrow(630,185,630,215)+
      box(500,215,320,0,'#f1f1f3')+
      box(460,215,300,34,C.okSoft)+txt(610,237,"Алерты: Telegram · email · task_failed",12,'#0f8a02',700)+
      '<line x1="130" y1="185" x2="130" y2="215" stroke="'+C.muted+'" stroke-width="2" stroke-dasharray="4 3"/>'+
      box(40,215,240,34,C.bg)+txt(160,237,"/health: scheduler heartbeat < 30 сек",11.5,C.muted)+
      txt(410,32,"Мониторинг превращает Airflow из «чёрного ящика» в управляемую платформу",13,C.ink,700)+
      '</svg>',

    // ---------- Урок 10 ----------
    l10_case: '<svg viewBox="0 0 820 260">'+
      kcard(20, 20, 385, 170, C.red, "Сегодня", [
        "CSV-файлы на FTP-сервере",
        "Отчёты вручную в Excel - 2 часа в день",
        "Отчётность с задержкой в 3 дня",
        "Частые ошибки ручной обработки"
      ])+
      kcard(415, 20, 385, 170, "#0f8a02", "Хочет руководство", [
        "Ежедневные отчёты к 9:00 утра",
        "Анализ данных в реальном времени",
        "Меньше ошибок в отчётности",
        "Полная автоматизация обработки"
      ])+
      box(20, 205, 780, 38, 'rgba(57,255,20,.10)', 10)+
      txt(410, 229, "1 000 000 абонентов · 99 регионов · 500 000 звонков в день · 5 тарифов", 12.5, C.ink, 700)+
      '</svg>'

  };

  // ---------- Состояние и хранилище ----------
  function emptyState() {
    return { lessons: {} }; // { [num]: { answers: {qi: chosenIdx}, best: n, passed: bool } }
  }
  var state = load();
  function load() {
    try {
      var raw = localStorage.getItem(COURSE.storageKey);
      if (raw) { var s = JSON.parse(raw); if (s && s.lessons) return s; }
    } catch (e) {}
    return emptyState();
  }
  function save() {
    try { localStorage.setItem(COURSE.storageKey, JSON.stringify(state)); } catch (e) {}
    renderNav();
  }
  function ls(num) { return state.lessons[num] || { answers: {}, best: 0, passed: false }; }
  function isUnlocked(i) { // i = индекс в LESSONS
    if (i === 0) return true;
    var prev = ls(LESSONS[i-1].num);
    return !!prev.passed;
  }
  function progressSummary() {
    var done = 0, correct = 0, totalQ = 0;
    LESSONS.forEach(function (L) {
      totalQ += L.quiz.length;
      var s = ls(L.num);
      if (s.passed) done++;
      Object.keys(s.answers).forEach(function (qi) {
        var perm = (s.order && s.order[qi]) || [0, 1, 2];
        if (s.answers[qi] === perm.indexOf(L.quiz[qi].correct)) correct++;
      });
    });
    return { done: done, lessons: LESSONS.length, correct: correct, totalQ: totalQ };
  }

  // ---------- Навигация ----------
  function renderNav() {
    var hash = location.hash || "#/";
    topnav.innerHTML = "";
    var home = document.createElement("a");
    home.href = "#/"; home.textContent = "Обзор"; home.title = "Главная и прогресс";
    if (hash === "#/" || hash === "" ) home.className = "active";
    topnav.appendChild(home);
    LESSONS.forEach(function (L, i) {
      var a = document.createElement("a");
      a.href = isUnlocked(i) ? "#/lesson/" + L.num : "#/lesson/" + L.num;
      a.textContent = L.num;
      a.title = L.title + (isUnlocked(i) ? "" : " - откроется после урока " + (i));
      var s = ls(L.num);
      if (!isUnlocked(i)) a.classList.add("locked");
      else if (s.passed) a.classList.add("done");
      if (hash === "#/lesson/" + L.num) a.classList.add("active");
      topnav.appendChild(a);
    });
  }

  // ---------- Хелперы рендера ----------
  function esc(s) {
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }
  function grad(i) { return "linear-gradient(135deg," + PALETTE[i % PALETTE.length][0] + "," + PALETTE[i % PALETTE.length][1] + ")"; }
  function ring(pct, size, stroke, color, label) {
    var r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c * (1 - pct);
    return '<svg class="ring" width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'">'+
      '<circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" fill="none" stroke="#e3e6f0" stroke-width="'+stroke+'"/>'+
      '<circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" fill="none" stroke="'+color+'" stroke-width="'+stroke+'" stroke-linecap="round" '+
      'stroke-dasharray="'+c.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'" transform="rotate(-90 '+size/2+' '+size/2+')"/>'+
      '<text class="pct" x="'+size/2+'" y="'+(size/2+2)+'" text-anchor="middle">'+Math.round(pct*100)+'%</text>'+
      '<text class="lbl" x="'+size/2+'" y="'+(size/2+20)+'" text-anchor="middle">'+(label||"ПРОГРЕСС")+'</text></svg>';
  }

  // ---------- Главная ----------
  function renderHome() {
    var p = progressSummary();
    var pct = p.correct / p.totalQ;
    var remainingQ = p.totalQ - p.correct;
    var html = '<div class="page">'+
      '<div class="hero">'+
        '<h1>'+COURSE.title+'</h1>'+
        '<p>'+COURSE.hero+'</p>'+
        '<div class="chips">'+COURSE.heroChips.map(function(c){return '<span class="chip">'+c+'</span>';}).join("")+'</div>'+
      '</div>'+
      '<div class="dashboard">'+
        '<div class="card">'+
          ' <h2>'+icon("chart")+' Ваш прогресс</h2>'+
          '<div class="ring-wrap">'+
            ring(pct, 120, 13, pct >= 1 ? "#39ff14" : "#39ff14")+
            '<div class="stats">'+
              '<div class="stat"><span>Уроков пройдено</span><b>'+p.done+' / '+p.lessons+'</b></div>'+
              '<div class="stat"><span>Заданий выполнено</span><b>'+p.correct+' / '+p.totalQ+'</b></div>'+
              '<div class="stat"><span>Осталось уроков</span><b>'+(p.lessons - p.done)+'</b></div>'+
              '<div class="stat"><span>Осталось вопросов</span><b>'+remainingQ+'</b></div>'+
            '</div>'+
          '</div>'+
          '<div class="reset-row"><button id="resetProgressBtn" class="btn-ghost btn btn-sm">Сбросить прогресс</button></div>'+
        '</div>'+
        '<div class="card">'+
          '<h2>'+icon("target")+' Как устроен учебник</h2>'+
          '<div class="prose" style="font-size:14.5px;color:var(--muted)">'+
            '<p>Каждый урок построен по материалам одной-двух сессий курса: <b>теория с иллюстрациями</b> → <b>разбор практического задания</b> → <b>тест из 10 вопросов</b>.</p>'+
            '<p>Для зачёта урока нужно набрать <b>не менее '+COURSE.passScore+' из 10</b>. После зачёта открывается следующий урок. Прогресс сохраняется автоматически в этом браузере.</p>'+
          '</div>'+
        '</div>'+
      '</div>'+
      '<div class="lessons-grid">';
    LESSONS.forEach(function (L, i) {
      var unlocked = isUnlocked(i), s = ls(L.num);
      var answeredCount = Object.keys(s.answers).length;
      var status, statusCls;
      if (!unlocked) { status = icon("lock", 13) + " Закрыт"; statusCls = "locked"; }
      else if (s.passed) { status = "✓ Пройден · " + s.best + "/10"; statusCls = "done"; }
      else if (answeredCount > 0) { status = "В процессе · " + answeredCount + "/" + L.quiz.length; statusCls = "inprogress"; }
      else { status = "Начать →"; statusCls = ""; }
      var inner = '<div class="lc-top">'+
          '<div class="lc-num">'+L.num+'</div>'+
          '<div><div class="lc-kicker">'+L.kicker+'</div></div>'+
        '</div>'+
        '<div class="lc-title">'+L.title+'</div>'+
        '<div class="lc-desc">'+L.desc+'</div>'+
        '<div class="lc-foot">'+
          '<div class="mini-bar"><i style="width:'+(s.passed?100:Math.round(answeredCount/L.quiz.length*100))+'%"></i></div>'+
          '<span class="lc-status '+statusCls+'">'+status+'</span>'+
        '</div>';
      html += unlocked
        ? '<a class="lesson-card" href="#/lesson/'+L.num+'">'+inner+'</a>'
        : '<a class="lesson-card locked" href="#/lesson/'+L.num+'" title="Пройдите предыдущий урок, чтобы открыть">'+inner+'</a>';
    });
    html += '</div></div>';
    app.innerHTML = html;
  }

  // ---------- Урок ----------
  function renderLesson(num) {
    var i = -1;
    LESSONS.forEach(function (L, idx) { if (L.num === num) i = idx; });
    if (i < 0) { renderHome(); return; }
    var L = LESSONS[i];
    if (!isUnlocked(i)) {
      app.innerHTML = '<div class="page card locked-overlay" style="margin-top:40px">'+
        '<div class="big">'+icon("lock",56)+'</div>'+
        '<h2>Урок '+L.num+' пока закрыт</h2>'+
        '<p style="color:var(--muted)">Учебник открывается постепенно: чтобы начать этот урок, пройдите тест урока '+i+' - «'+esc(LESSONS[i-1].title)+'».</p>'+
        '<a class="btn" href="#/lesson/'+LESSONS[i-1].num+'">← Перейти к уроку '+LESSONS[i-1].num+'</a> '+
        '<a class="btn ghost" href="#/">К списку уроков</a>'+
      '</div>';
      return;
    }
    var s = ls(L.num);
    // если все вопросы уже отвечены - показываем финал с текущим результатом

    var prevImgTitle = null;
    var sectionsHtml = L.sections.map(function (sec, si) {
      if (sec.type === "svg") {
        var svg = window.ILLUS[sec.id] || "";
        return '<div class="illus">'+svg+(sec.cap ? '<div class="cap">'+sec.cap+'</div>' : '')+'</div>';
      }
      if (sec.type === "img") {
        var showTitle = sec.title && sec.title !== prevImgTitle;
        prevImgTitle = sec.title || null;
        return '<div class="illus">'+(showTitle ? '<div class="illus-title">'+sec.title+'</div>' : '')+
          '<img src="'+sec.src+'" alt="'+sec.title+'" loading="lazy"></div>';
      }
      if (sec.type === "table") {
        var t = '<div class="tbl-wrap"><table class="tbl"><tr>' + sec.headers.map(function(h){return '<th>'+h+'</th>';}).join("") + '</tr>';
        sec.rows.forEach(function (r) { t += '<tr>' + r.map(function (c) { return '<td>'+c+'</td>'; }).join("") + '</tr>'; });
        return t + '</table></div>';
      }
      if (sec.type === "code") {
        return '<div class="code"><pre>'+sec.code.replace(/&/g,"&amp;").replace(/</g,"&lt;")+'</pre></div>';
      }
      if (sec.type === "note") {
        return ' <div class="note'+(sec.warn?' warn':'')+'"><span class="ico">'+icon(sec.warn?"warn":"bulb",18)+'</span><div>'+sec.html+'</div></div>';
      }
      return '<div class="prose">'+sec.html+'</div>';
    }).join("");

    var html = '<div class="page">'+
      '<a class="back-link" href="#/">← Все уроки курса</a>'+
      '<div class="lesson-head">'+
        '<div class="kicker">'+COURSE.code+' · Урок '+L.num+' из '+LESSONS.length+' · '+L.kicker+'</div>'+
        '<h1>'+L.title+'</h1>'+
        '<p>'+L.desc+'</p>'+
      '</div>'+
      sectionsHtml+
      '<div class="practice">'+
        '<h2>'+icon("flask")+' '+L.practice.title+'</h2>'+
        '<p style="margin:0 0 8px;color:var(--muted);font-size:15px">'+L.practice.intro+'</p>'+
        '<ol>'+L.practice.steps.map(function(st){return '<li>'+st+'</li>';}).join("")+'</ol>'+
        (L.practice.tools ? '<div class="dl-block"><div class="dl-title">'+icon("link",15)+' Программы и сервисы</div>'+
          '<div class="dl-list">'+L.practice.tools.map(function(t){
            return '<a class="dl-item" href="'+t.href+'" target="_blank" rel="noopener">'+icon("download",14)+' '+t.name+'</a>';
          }).join("")+'</div></div>' : '')+
        (L.practice.files ? '<div class="dl-block"><div class="dl-title">'+icon("download",15)+' Файлы для практики - скачайте перед началом</div>'+
          '<div class="dl-list">'+L.practice.files.map(function(f){
            return '<a class="dl-item" href="'+f.href+'" download>'+icon("file",14)+' '+f.name+(f.desc?'<small>'+f.desc+'</small>':'')+'</a>';
          }).join("")+'</div></div>' : '')+
      '</div>'+
      '<div id="quizRoot"></div>'+
      '<div class="lesson-footer-nav">'+
        (i > 0 ? '<a class="btn secondary" href="#/lesson/'+LESSONS[i-1].num+'">← Урок '+LESSONS[i-1].num+'</a>' : '<span></span>')+
        (i < LESSONS.length-1
          ? (s.passed ? '<a class="btn ok" href="#/lesson/'+LESSONS[i+1].num+'">Урок '+LESSONS[i+1].num+' →</a>'
                      : '<span class="pass-note" style="margin:0">'+icon("lock",14)+' Урок '+LESSONS[i+1].num+' откроется после зачёта (≥ '+COURSE.passScore+' из 10)</span>')
          : (s.passed ? '<span class="pass-note" style="margin:0">'+icon("trophy",16)+' Это последний урок курса - вы дошли до конца!</span>' : '<span></span>'))+
      '</div>'+
    '</div>';
    app.innerHTML = html;
    renderQuiz(L, i);
  }

  // ---------- Квиз ----------
  function renderQuiz(L, lessonIdx) {
    var root = document.getElementById("quizRoot");
    if (!root) return;
    var s = ls(L.num);
    var quiz = L.quiz;
    // перемешивание вариантов: сохраняем порядок в состоянии, чтобы ответы оставались верными
    if (!s.order) {
      var legacy = Object.keys(s.answers).length > 0;
      s.order = quiz.map(function () {
        var p = [0, 1, 2];
        if (legacy) return p; // старые попытки без перемешивания - оставить как было
        for (var i = p.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var t = p[i]; p[i] = p[j]; p[j] = t;
        }
        return p;
      });
      state.lessons[L.num] = s;
      save();
    }
    function correctPos(qi) { return s.order[qi].indexOf(quiz[qi].correct); }

    // финал
    function renderFinal(score, fresh) {
      var passed = score >= COURSE.passScore;
      var nextUnlocked = lessonIdx < LESSONS.length - 1;
      root.innerHTML = '<div class="quiz-card">'+
        '<div class="quiz-result">'+
          ring(score/quiz.length, 150, 16, passed ? "#39ff14" : "#ff5c5c", "РЕЗУЛЬТАТ")+
          '<div class="score" style="color:'+(passed?'var(--ok)':'var(--bad)')+'">'+score+' / '+quiz.length+'</div>'+
          '<div class="verdict">'+(passed
            ? icon("check",15)+' Урок зачтён! '+(nextUnlocked?'Открыт следующий урок.':'')
            : 'Не хватает до зачёта. Нужно не менее '+COURSE.passScore+' правильных ответов.')+'</div>'+
          '<div class="quiz-actions" style="justify-content:center">'+
            '<button class="btn ghost" id="retryBtn">'+icon("refresh",15)+' Пройти ещё раз</button>'+
            (passed && nextUnlocked ? '<a class="btn ok" href="#/lesson/'+LESSONS[lessonIdx+1].num+'">Урок '+LESSONS[lessonIdx+1].num+' →</a>' : '')+
            (passed && !nextUnlocked ? '<a class="btn ok" href="#/">К списку уроков</a>' : '')+
          '</div>'+
        '</div>'+
      '</div>';
      var rb = document.getElementById("retryBtn");
      if (rb) rb.onclick = function () { delete state.lessons[L.num]; save(); renderLesson(L.num); window.scrollTo(0, 0); };
      if (passed) { window.scrollTo(0, document.body.scrollHeight); }
    }

    // все уже отвечены ранее?
    if (Object.keys(s.answers).length === quiz.length) {
      var sc = 0;
      quiz.forEach(function (Q, qi) { if (s.answers[qi] === correctPos(qi)) sc++; });
      renderFinal(sc, false);
      return;
    }

    // первый неотвеченный вопрос
    var qi = 0;
    while (qi < quiz.length && s.answers[qi] !== undefined) qi++;

    function renderQuestion() {
      if (qi >= quiz.length) {
        var sc = 0;
        quiz.forEach(function (Q, i2) { if (s.answers[i2] === correctPos(i2)) sc++; });
        s.best = Math.max(s.best || 0, sc);
        s.passed = sc >= COURSE.passScore;
        state.lessons[L.num] = s; save();
        renderFinal(sc, true);
        renderNav();
        return;
      }
      var Q = quiz[qi];
      var perm = s.order[qi];
      var correctIdx = perm.indexOf(Q.correct);
      var dots = quiz.map(function (_, d) {
        var cls = d === qi ? "cur" : (s.answers[d] === undefined ? "" : (s.answers[d] === correctPos(d) ? "ok" : "bad"));
        return '<span class="dot '+cls+'"></span>';
      }).join("");
      root.innerHTML = '<div class="quiz-card">'+
        '<div class="quiz-head"><h2>'+icon("pencil")+' Тест урока</h2><span class="quiz-badge">10 вопросов · зачёт от '+COURSE.passScore+'/10</span></div>'+
        '<div class="quiz-sub">Отвечайте на вопросы по очереди. После выбора вы увидите пояснение.</div>'+
        '<div class="q-progress">'+dots+'</div>'+
        '<div style="color:var(--muted);font-size:13px;font-weight:700;margin-bottom:4px">Вопрос '+(qi+1)+' из '+quiz.length+'</div>'+
        '<div class="q-text">'+Q.q+'</div>'+
        (Q.code ? '<div class="q-code">'+Q.code.replace(/&/g,"&amp;").replace(/</g,"&lt;")+'</div>' : '')+
        '<div class="answers" id="answers"></div>'+
        '<div class="feedback" id="feedback"></div>'+
        '<div class="quiz-actions">'+
          '<button class="btn" id="nextQ" disabled>Следующий вопрос →</button>'+
          '<span style="color:var(--muted);font-size:13.5px" id="hint"></span>'+
        '</div>'+
      '</div>';
      var ansWrap = document.getElementById("answers");
      var letters = ["А", "Б", "В"];
      perm.forEach(function (origIdx, oi) {
        var opt = Q.options[origIdx];
        var b = document.createElement("button");
        b.className = "answer";
        b.innerHTML = '<span class="letter">'+letters[oi]+'</span><span>'+opt+'</span>';
        b.onclick = function () { choose(oi); };
        ansWrap.appendChild(b);
      });
      var fb = document.getElementById("feedback");
      var nextBtn = document.getElementById("nextQ");

      function choose(oi) {
        var btns = ansWrap.querySelectorAll(".answer");
        btns.forEach(function (b, oi2) {
          b.disabled = true;
          if (oi2 === correctIdx) b.classList.add("correct");
          else if (oi2 === oi) b.classList.add("wrong");
          else b.classList.add("dim");
        });
        var ok = oi === correctIdx;
        s.answers[qi] = oi;
        state.lessons[L.num] = s;
        save();
        fb.className = "feedback " + (ok ? "ok" : "bad");
        fb.innerHTML = (ok ? '<b>'+icon("check",15)+' Верно!</b>' : '<b>'+icon("cross",15)+' Не совсем.</b>') + esc(Q.explain);
        nextBtn.disabled = false;
        document.getElementById("hint").textContent = ok ? "" : "Правильный ответ: " + letters[correctIdx];
        // обновить карточку на главной не требуется; nav обновится на save()
      }
      nextBtn.onclick = function () { qi++; renderQuestion(); };
      window.scrollTo({ top: root.offsetTop - 80, behavior: "smooth" });
    }
    renderQuestion();
  }

  // ---------- Роутер ----------
  function route() {
    var hash = location.hash || "#/";
    var m = hash.match(/^#\/lesson\/(\d+)$/);
    if (m) renderLesson(parseInt(m[1], 10));
    else renderHome();
    renderNav();
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);

  document.getElementById("menuBtn").addEventListener("click", function () {
    topnav.classList.toggle("open");
  });
  topnav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") topnav.classList.remove("open");
  });

  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest("#resetProgressBtn") : null;
    if (!btn) return;
    if (confirm("Сбросить весь прогресс учебника? Это действие нельзя отменить.")) {
      state = emptyState();
      save();
      route();
    }
  });

  route();
})();
