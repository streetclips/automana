import { EMBERKIN, VORTHRAX_THREATS, WILDWOOD } from "../content";
import { renderCard, land } from "../render/card";
import { nemesisFace, otherNemesis, threatDeckBack, walkerFace } from "../render/faces";
import { fan } from "../render/layout";
import { pips } from "../render/pips";
import { board, cardListRows, chip, landChip, page, status, turn } from "./components";

export function buildPages(): string[] {
  const pages: string[] = [];
  const coverFan = fan([renderCard("thicket-bear", "lg"), walkerFace("B", "lg"), nemesisFace("A", "lg"), renderCard("ember-bolt", "lg")], [-20, -7, 7, 20], 22);
  pages.push(page(`
<h1>PALMWALKER</h1>
<div class="sub">UN DUELO DE CARTAS EN SOLITARIO QUE SE JUEGA EN LAS MANOS</div>
<div class="tagline">Sin mesa. Sin fichas. Sin rival al otro lado.<br>Solo tus manos, tus hechizos y una Némesis que quiere reducir tu biblioteca a cenizas.</div>
<div class="fan">${coverFan}</div>
<div class="meta"><span>1 JUGADOR</span><span>15–20 MIN</span><span>39 CARTAS</span><span>12+ AÑOS</span></div>
<div class="ver">REGLAMENTO · PROTOTIPO v0.1</div>
`, undefined, "cover"));
  pages.push(page(`
<h2>Bienvenido, Caminante</h2>
<p class="lead">Palmwalker toma el corazón de un juego de cartas de duelo clásico —tierras, criaturas, instantáneos, combate y un caminante
a tu lado— y lo convierte en algo que puedes jugar de pie en el tren. Todo ocurre en tus dos manos.</p>
<div class="cols">
<div>
<h3>El duelo en un párrafo</h3>
<p>Eres <b>Kael</b>, un piromante errante. Cada turno robas, juegas una tierra, lanzas criaturas y hechizos, y atacas.
Tu enemiga es una <b>Némesis</b>: un jefe automático con su propio mazo de Amenazas. Invoca criaturas, lanza hechizos, ataca y bloquea
siguiendo unas pocas reglas fijas, así que nunca tienes que decidir por ella.</p>
<h3>Tres ideas para que quepa en tus manos</h3>
<ol>
<li><b>Tu biblioteca es tu vida.</b> Empiezas con 20 cartas en la biblioteca: 20 vidas. El daño manda cartas de tu biblioteca al cementerio.</li>
<li><b>Cada carta es también una tierra.</b> El dorso de cada carta es una Montaña o un Bosque. Cada turno eliges: lanzarla o convertirla en maná.</li>
<li><b>La posición es el estado.</b> Las cartas se giran bajándolas en el abanico. Las zonas son partes de un paquete, no lugares de una mesa.</li>
</ol>
</div>
<div>
<h3>Índice</h3>
<div class="toc" style="columns:1">
<div><span>Componentes</span><span>3</span></div>
<div><span>Anatomía de una carta</span><span>4</span></div>
<div><span>Tipos de carta y habilidades</span><span>5</span></div>
<div><span>Kael, tu Caminante</span><span>6</span></div>
<div><span>La Némesis</span><span>7</span></div>
<div><span>Cómo se sujeta</span><span>8</span></div>
<div><span>Vida, zonas y movimientos</span><span>9</span></div>
<div><span>Preparación</span><span>10</span></div>
<div><span>Estructura del turno</span><span>11</span></div>
<div><span>Combate y la mente de la Némesis</span><span>12</span></div>
<div><span>Partida de ejemplo</span><span>13–16</span></div>
<div><span>Galería de cartas</span><span>17</span></div>
<div><span>Modos, otras Némesis y ajustes</span><span>18</span></div>
<div><span>Listas de cartas</span><span>19</span></div>
<div><span>Referencia rápida</span><span>20</span></div>
</div>
<div class="box">
<h3>Inspirado en</h3>
<p class="mini">La tradición <i>in-hand</i> de BoardGameGeek: <b>Palm Island</b> (cartas de 4 estados, recursos girados),
<b>Handy Brawl</b> (un enemigo que actúa solo, el daño como estado de las cartas), <b>Maiden's Quest</b> (construcción de mazo en la mano),
<b>Galdor's Grip</b> y <b>Loot the Loop</b> (orden y orientación como estado del juego) y <b>The Hand of Destiny</b> (héroe contra oleadas y un jefe).</p>
</div>
</div>
</div>
`, 2));
  pages.push(page(`
<h2>Componentes <small>39 CARTAS</small></h2>
<table>
<tr><th>Cant.</th><th>Componente</th><th>Para qué sirve</th></tr>
<tr><td>12</td><td>Medio grimorio <b>Clan Ascua</b> (rojo)</td><td>Criaturas rápidas y daño directo. Todos los dorsos son <b>Montaña</b> ${pips("{R}")}.</td></tr>
<tr><td>12</td><td>Medio grimorio <b>Monteverde</b> (verde)</td><td>Criaturas grandes y trucos de refuerzo. Todos los dorsos son <b>Bosque</b> ${pips("{G}")}.</td></tr>
<tr><td>1</td><td><b>Kael</b>, Piromante Errante</td><td>Tu Caminante. Una carta de 4 estados que registra la lealtad girándola y volteándola.</td></tr>
<tr><td>1</td><td><b>Vorthrax</b>, el Tirano de Ceniza</td><td>La Némesis. Cara A = Fase 1, Cara B = Fase 2. Gírala para el modo Heroico.</td></tr>
<tr><td>15</td><td>Mazo de <b>Amenaza</b></td><td>Las criaturas y hechizos de Vorthrax. También es su vida.</td></tr>
<tr><td>1</td><td>Carta de referencia rápida</td><td>Orden del turno y reglas de la Némesis.</td></tr>
</table>
<div class="row center" style="gap:6mm; margin-top:4mm">
<div class="fig">${renderCard("reckless-goblin", "md")}<div class="cap">Carta de Clan Ascua (frente)</div></div>
<div class="fig">${land("Mountain", "md")}<div class="cap">…y su dorso</div></div>
<div class="fig">${renderCard("thicket-bear", "md")}<div class="cap">Carta de Monteverde (frente)</div></div>
</div>
<div class="row center" style="gap:4mm; margin-top:4mm; flex-wrap:nowrap">
<div class="fig">${land("Forest", "sm")}<div class="cap">Dorso de Monteverde</div></div>
<div class="fig">${renderCard("cinderclaw-brute", "sm")}<div class="cap">Criatura de Amenaza</div></div>
<div class="fig">${renderCard("searing-breath", "sm")}<div class="cap">Hechizo de Amenaza</div></div>
<div class="box" style="width:58mm; margin:0">
<h3>Medios grimorios</h3>
<p class="mini">Como un sobre preconstruido, cada color viene en una mitad de 12 cartas. Baraja dos mitades cualesquiera y tendrás un Grimorio de 24 cartas.
Las futuras mitades (blanca, azul, negra…) se combinan con estas: 5 colores dan 10 mazos distintos.</p>
<h3>Las Amenazas no tienen dorso jugable</h3>
<p class="mini">El mazo de Amenaza usa un dorso liso. Las Amenazas boca abajo son la vida de Vorthrax; las boca arriba son el <b>Presagio</b> (delante) y la <b>Ruina</b> (detrás).</p>
</div>
</div>
`, 3));
  pages.push(page(`
<h2>Anatomía de una Carta</h2>
<p>Las cartas de Palmwalker se leen en <b>abanico</b>. Cuando se solapan, solo se ve su borde izquierdo, igual que el índice de la esquina
de una baraja de naipes. Por eso cada carta lleva su información clave en la <b>franja índice</b> de su lado izquierdo.</p>
<div style="position:relative; height:96mm; margin-top:6mm">
  <div style="position:absolute; left:58mm; top:4mm">${renderCard("cinder-hound", "lg")}</div>
  <div class="callout" data-n="1" style="left:4mm; top:6mm"><b>Coste</b>: el número grande es el maná total; los símbolos dicen de qué color. La franja tiene el color de la carta.</div>
  <div class="callout" data-n="2" style="left:4mm; top:32mm"><b>Símbolo de tipo</b>: ⚔ criatura, ϟ instantáneo, ✶ conjuro, ◈ aura, ▲ tierra, ✹ Amenaza.</div>
  <div class="callout" data-n="3" style="left:4mm; top:62mm"><b>Fuerza / Resistencia</b>: en grande al pie de la franja; se lee aunque la carta esté tapada en el abanico.</div>
  <div class="callout" data-n="4" style="left:126mm; top:4mm"><b>Nombre</b> sobre la ilustración.</div>
  <div class="callout" data-n="5" style="left:126mm; top:24mm"><b>Ilustración a sangre</b> en estilo papel recortado.</div>
  <div class="callout" data-n="6" style="left:126mm; top:48mm"><b>Línea de tipo</b>: tipo de carta y tipo de criatura.</div>
  <div class="callout" data-n="7" style="left:126mm; top:68mm"><b>Texto de reglas</b> sobre un panel de cristal. La cursiva es ambientación.</div>
  <div class="marker" style="left:56mm; top:6mm">1</div>
  <div class="marker" style="left:56mm; top:21mm">2</div>
  <div class="marker" style="left:56mm; top:74mm">3</div>
  <div class="marker" style="left:113mm; top:5mm">4</div>
  <div class="marker" style="left:113mm; top:28mm">5</div>
  <div class="marker" style="left:113mm; top:56mm">6</div>
  <div class="marker" style="left:113mm; top:70mm">7</div>
</div>
<div class="cols">
<div class="box">
<h3>Doble cara: ¿hechizo o tierra?</h3>
<p class="mini">El dorso de cada carta del Grimorio es una tierra. Una vez por turno puedes <b>voltear una carta de tu mano por su lado de tierra</b> y jugarla.
La tierra es permanente; el hechizo de su frente se pierde para siempre. Elegir qué cartas sacrificar como tierras es la primera decisión de cada turno.</p>
</div>
<div class="box">
<h3>Maná</h3>
<p class="mini">Cada tierra produce un maná de su color: Montaña ${pips("{R}")}, Bosque ${pips("{G}")}.
Para usarla, <b>bájala</b> (gírala). Las tierras se alzan al empezar tu turno, así que el maná que gastas en tu turno <b>no</b> está disponible durante el turno de la Némesis.</p>
</div>
</div>
`, 4));
  pages.push(page(`
<h2>Tipos de Carta y Habilidades</h2>
<div class="row center" style="gap:4mm">
<div class="fig">${renderCard("mossback-boar", "md")}<div class="cap"><b>Criatura</b>: se queda en la Mesa. Ataca y bloquea.</div></div>
<div class="fig">${renderCard("ember-bolt", "md")}<div class="cap"><b>Instantáneo</b>: lánzalo cuando quieras, incluso en el turno de la Némesis.</div></div>
<div class="fig">${renderCard("volcanic-roar", "md")}<div class="cap"><b>Conjuro</b>: solo en tu fase principal.</div></div>
</div>
<div class="row center" style="gap:4mm; margin-top:3mm">
<div class="fig">${renderCard("wild-strength", "md")}<div class="cap"><b>Aura</b>: métela detrás de una de tus criaturas.</div></div>
<div class="fig">${land("Forest", "md")}<div class="cap"><b>Tierra</b>: el dorso de cada carta.</div></div>
<div class="box" style="width:56mm">
<h3>Reglas de criaturas</h3>
<ol class="mini">
<li><b>Mareo de invocación:</b> una criatura no puede atacar ni usar habilidades ${pips("{T}")} el turno en que entra, salvo que tenga Prisa. <b>Sí</b> puede bloquear.</li>
<li><b>El daño se borra</b> al final de cada turno. Una criatura solo muere si recibe en un mismo turno un daño igual o mayor que su resistencia.</li>
<li><b>Límite:</b> 4 criaturas por bando y 5 tierras.</li>
<li>Un Aura va al cementerio junto con su criatura.</li>
</ol>
</div>
</div>
<div class="box" style="margin-top:4mm">
<h3>Habilidades clave</h3>
<div class="kw" style="grid-template-columns: 24mm 1fr">
<div class="k">Volar</div><div>Solo pueden bloquearla criaturas con Volar o Alcance.</div>
<div class="k">Alcance</div><div>Puede bloquear criaturas con Volar.</div>
<div class="k">Arrollar</div><div>El daño que sobra después de matar a su bloqueador va al jugador o a la Némesis que defiende.</div>
<div class="k">Prisa</div><div>Ignora el mareo de invocación: puede atacar el turno en que entra.</div>
<div class="k">Defensor</div><div>Nunca ataca. Sí bloquea.</div>
</div>
</div>
`, 5));
  pages.push(page(`
<h2>Kael, tu Caminante</h2>
<p>Kael está en el extremo derecho de tu abanico. Su carta tiene <b>cuatro estados</b>, uno en cada mitad de cada cara, al estilo de Palm Island.
El estado que se lee al derecho, mirando hacia ti, es el activo. Cada estado indica las habilidades que puedes usar desde él.</p>
<div class="row center" style="gap:10mm; margin:3mm 0 2mm">
<div class="fig">${walkerFace("A")}<div class="cap">Cara A: estado I al derecho, estado II del revés</div></div>
<div class="fig">${walkerFace("B")}<div class="cap">Cara B: estado III al derecho, estado IV del revés</div></div>
</div>
<div class="box" style="text-align:center; font-family:Copperplate,serif; color:#6b2d14; font-size:10pt">
I &nbsp;—<i>girar 180°</i>→&nbsp; II &nbsp;—<i>voltear</i>→&nbsp; III &nbsp;—<i>girar 180°</i>→&nbsp; IV
</div>
<div class="cols">
<div>
<h3>Cómo usar a Kael</h3>
<ol>
<li>Una vez por turno, durante una de <b>tus fases principales</b>, usa una habilidad disponible en el estado actual de Kael.</li>
<li><b>Cargar</b> avanza a Kael 1 estado (máximo IV). Puedes cargar aunque no tengas ninguna criatura que reforzar.</li>
<li><b>Descargar</b> retrocede a Kael 2 estados (desde III o IV).</li>
<li><b>Definitiva</b> necesita el estado IV y devuelve a Kael al I.</li>
</ol>
</div>
<div class="box">
<h3>El dilema del Caminante</h3>
<p class="mini">Cargar es poca cosa, pero acerca la Definitiva. Descargar elimina un bloqueador ya. Quedarse en IV esperando el
momento justo (por ejemplo, hasta que Vorthrax pierda su Piel de Ceniza) puede ser la mejor jugada de la partida. A Kael no se le puede atacar.</p>
</div>
</div>
`, 6));
  pages.push(page(`
<h2>La Némesis</h2>
<p>La Némesis es tu rival. Su carta está a la izquierda de tu abanico y su <b>mazo de Amenaza</b> va detrás. No tiene mano ni maná:
cada turno simplemente ejecuta la carta boca arriba que hay encima de su mazo, el <b>Presagio</b>.</p>
<div class="row center" style="gap:10mm; margin:3mm 0">
<div class="fig">${nemesisFace("A")}<div class="cap">Cara A: Fase 1 (gírala 180° para el modo Heroico)</div></div>
<div class="fig">${nemesisFace("B")}<div class="cap">Cara B: Fase 2</div></div>
</div>
<div class="cols">
<div>
<h3>El mazo de Amenaza es su vida</h3>
<ol>
<li>Las Amenazas <b>boca abajo</b> son la vida de Vorthrax. Cuando llega a 0, ganas.</li>
<li>El <b>Presagio</b> está boca arriba encima del mazo y muestra lo que hará Vorthrax el próximo turno. No cuenta como vida.</li>
<li>La <b>Ruina</b> está boca arriba al fondo: criaturas de Amenaza muertas y cartas destruidas por daño.</li>
<li><b>Daño a Vorthrax:</b> por cada punto, pasa a la Ruina la carta boca abajo que hay justo detrás del Presagio.</li>
</ol>
</div>
<div>
<h3>Fases</h3>
<p>En cuanto al mazo de Amenaza le quedan <b>7 o menos</b> cartas boca abajo, voltea a Vorthrax a la Fase 2, aunque estés a mitad de tu turno.
<b>Reavivar</b> devuelve al momento las 3 últimas cartas de la Ruina, boca abajo, al fondo del mazo: una segunda barra de vida.</p>
<div class="box dark mini">La <b>Fase 1</b> es acorazada (Piel de Ceniza) y paciente. La <b>Fase 2</b> pierde la coraza, pero sus criaturas ganan Prisa y su daño se duplica.
Rompe la coraza y luego sobrevive a la furia.</div>
</div>
</div>
<div class="row center" style="gap:4mm">
${renderCard("ash-imp", "sm")}${renderCard("magma-sentinel", "sm")}${renderCard("scorch-fiend", "sm")}${renderCard("cinder-rebirth", "sm")}
</div>
`, 7));
  const leftFan = fan([threatDeckBack("sm", "MAZO DE<br>AMENAZA<br><span style='font-size:.7em'>Presagio encima</span>"), nemesisFace("A", "sm"), renderCard("cinderclaw-brute", "sm"), renderCard("thicket-bear", "sm"), walkerFace("A", "sm")], [-16, -8, 0, 8, 16], 9);
  pages.push(page(`
<h2>Cómo se Sujeta</h2>
<h3>Mano izquierda: LA MESA</h3>
<div class="row" style="align-items:center; gap:6mm; flex-wrap:nowrap">
<div class="fan" style="width:92mm; height:58mm; margin:0 0 0 8mm; flex:none">${leftFan}</div>
<div style="flex:1">
<p class="mini">Un solo abanico, de izquierda a derecha:</p>
<ol class="mini">
<li><b>Mazo de Amenaza</b> con el <b>Presagio</b> boca arriba encima.</li>
<li><b>Vorthrax</b> y después sus criaturas (marco rojo oscuro).</li>
<li>Tus criaturas, con sus Auras metidas detrás.</li>
<li><b>Kael</b> en el extremo derecho, con tus <b>tierras metidas detrás de él</b> de forma que solo asome su franja superior.</li>
</ol>
<p class="mini">De cada carta solo se ve la franja izquierda: justo donde está el índice.</p>
</div>
</div>
<h3>Mano derecha: EL GRIMORIO</h3>
<div class="row" style="align-items:center; gap:5mm; flex-wrap:nowrap">
<div class="exploded" style="flex:none">
<div class="layer">${renderCard("ember-bolt", "sm")}<div class="lbl">MANO<br><span style="font-size:7pt">lado hechizo · en abanico</span></div></div>
<div class="arrow">›</div>
<div class="layer">${land("Mountain", "sm")}<div class="lbl">BIBLIOTECA = VIDA<br><span style="font-size:7pt">lado tierra · cuadrada</span></div></div>
<div class="arrow">›</div>
<div class="layer">${renderCard("kindle", "sm")}<div class="lbl">CEMENTERIO<br><span style="font-size:7pt">lado hechizo · al fondo</span></div></div>
</div>
<div class="box mini" style="flex:1">Un solo paquete con tres capas, de <b>delante</b> (hacia ti) a <b>atrás</b>.
La biblioteca muestra su <b>lado de tierra</b>; la mano y el cementerio muestran el <b>lado de hechizo</b>. Así los límites entre zonas
se ven siempre, aunque el paquete esté cuadrado. (Sí: puedes ver el color de tu próximo robo. Es intencionado.)</div>
</div>
<h3>Alzada y bajada</h3>
<div class="row" style="align-items:center; gap:8mm; flex-wrap:nowrap">
<div class="updown" style="flex:none">${renderCard("thicket-bear", "sm")}${renderCard("firebrand-raider", "sm", { extra: "low" })}</div>
<div style="flex:1">
<p><b>Alzada</b> (alineada con el abanico) = enderezada. <b>Bajada</b> (deslizada unos 2 cm hacia abajo) = girada.</p>
<p>Una <b>tierra</b> bajada desaparece detrás de Kael: los símbolos de maná que ves son exactamente el maná que te queda.</p>
<p class="mini">¿Prefieres el giro clásico de 90°? Funciona con abanicos pequeños. Bajar la carta es más cómodo de sujetar.</p>
</div>
</div>
`, 8));
  pages.push(page(`
<h2>Vida, Zonas y Movimientos</h2>
<div class="box dark">
<h3>Tu biblioteca es tu vida</h3>
<p>Empiezas con <b>20 cartas en la biblioteca = 20 vidas</b>. Robar una carta cuesta 1 vida. El daño manda cartas al cementerio.
Ganar vida recupera cartas del cementerio. <b>Si tu biblioteca llega a 0, pierdes.</b></p>
<p style="margin:0">Vorthrax funciona igual: sus Amenazas boca abajo son su vida. <b>Si llega a 0, ganas.</b></p>
</div>
<table>
<tr><th style="width:30%">Cuando…</th><th>Haz esto con las manos</th></tr>
<tr><td><b>Robas</b></td><td>Coge la primera carta de tu biblioteca, voltéala al lado de hechizo y añádela al abanico de tu mano. (−1 vida)</td></tr>
<tr><td><b>Recibes N de daño</b></td><td>N veces: coge la primera carta de la biblioteca, voltéala al lado de hechizo y pásala al fondo del todo (cementerio).</td></tr>
<tr><td><b>Ganas N vidas</b></td><td>N veces: coge la última carta del cementerio, voltéala al lado de tierra y colócala entre la biblioteca y el cementerio. (Como máximo, tantas como cartas tenga tu cementerio.)</td></tr>
<tr><td><b>Juegas una tierra</b></td><td>Voltea una carta de la mano a su lado de tierra y métela detrás de Kael, con la franja superior asomando. Máximo 1 por turno.</td></tr>
<tr><td><b>Lanzas un hechizo</b></td><td>Baja tierras para pagar el coste. Criatura → al abanico de la Mesa, a la izquierda de Kael. Instantáneo/conjuro → se resuelve y va a tu cementerio.</td></tr>
<tr><td><b>Muere una criatura</b></td><td>Tuya → al fondo de tu cementerio. De Vorthrax → al fondo del mazo de Amenaza (Ruina).</td></tr>
<tr><td><b>Haces N de daño a Vorthrax</b></td><td>N veces: coge la carta boca abajo que hay justo detrás del Presagio, voltéala boca arriba y pásala a la Ruina.</td></tr>
<tr><td><b>Vorthrax lanza un hechizo</b></td><td>Resuélvelo y ponlo boca abajo al fondo del mazo de Amenaza (delante de la Ruina). Volverá a salir.</td></tr>
<tr><td><b>Descartas</b> (límite de mano)</td><td>Pon la carta al fondo de tu cementerio. Esto no es daño.</td></tr>
</table>
<div class="cols">
<div class="box mini"><h3>¿Por qué biblioteca = vida?</h3>El daño nunca es solo un número: cada punto te cuesta una carta real que podrías haber robado.
Curarte recupera hechizos gastados. Y como robar cuesta vida, esperar nunca sale gratis: el duelo siempre avanza.</div>
<div class="box mini"><h3>Contar</h3>La vida es un recuento de cartas. Cuenta tu biblioteca cuando lo necesites; con 20 cartas o menos se tarda segundos.
Los jugadores con experiencia la llevan de cabeza: −1 por robo, −N por golpe.</div>
</div>
`, 9));
  pages.push(page(`
<h2>Preparación <small>UN MINUTO, MÁS O MENOS</small></h2>
<div class="flow">
<div class="step"><div class="num">1</div><div class="sbody"><b>Arma tu Grimorio.</b> Elige dos medios grimorios (en esta caja: Clan Ascua + Monteverde) y baraja juntas las 24 cartas. Sujétalas con el lado de tierra hacia ti.</div></div>
<div class="step"><div class="num">2</div><div class="sbody"><b>Roba tu mano inicial.</b> Roba 4 cartas. Tu biblioteca tiene ahora 20 cartas: <b>tienes 20 vidas.</b></div></div>
<div class="step"><div class="num">3</div><div class="sbody"><b>Mulligan (opcional, una vez).</b> Baraja tu mano de vuelta, roba 4 cartas nuevas y pon 1 de ellas en tu cementerio. Tu vida sigue en 20.</div></div>
<div class="step"><div class="num">4</div><div class="sbody"><b>Kael.</b> Coloca a Kael en el estado <b>I</b> (Cara A, al derecho): empieza tu abanico de la Mesa.</div></div>
<div class="step"><div class="num n">5</div><div class="sbody"><b>La Némesis.</b> Coloca a Vorthrax por la Cara A (Fase 1) a la izquierda del abanico. Al derecho = Normal; girado 180° = Heroico.</div></div>
<div class="step"><div class="num n">6</div><div class="sbody"><b>El mazo de Amenaza.</b> Baraja las 15 Amenazas boca abajo, ponlas detrás de Vorthrax y voltea boca arriba la primera: es el primer <b>Presagio</b>. Vorthrax tiene <b>14 vidas</b>.</div></div>
<div class="step"><div class="num">7</div><div class="sbody"><b>Empieza.</b> Juegas tú primero y en ese turno no robas.</div></div>
</div>
<div class="row center" style="margin-top:6mm; gap:5mm; align-items:flex-end">
<div class="fig">${renderCard("reckless-goblin", "sm")}</div>
<div class="fig">${renderCard("thicket-bear", "sm")}</div>
<div class="fig">${renderCard("surge-of-vigor", "sm")}</div>
<div class="fig">${renderCard("ancient-crashhorn", "sm")}</div>
<div class="box mini" style="width:60mm"><h3>Una mano inicial típica</h3>Cuatro cartas, y cuatro tierras en potencia.
Aquí solo el Trasgo es rojo, así que convertirlo en Montaña sería perder tu única criatura de coste 1. Las decisiones empiezan antes del primer turno.</div>
</div>
`, 10));
  pages.push(page(`
<h2>Estructura del Turno</h2>
<div class="cols">
<div>
<h3>Tu turno</h3>
<div class="flow">
<div class="step"><div class="num">1</div><div class="sbody"><b>Enderezar.</b> Alza todas tus criaturas y tierras bajadas.</div></div>
<div class="step"><div class="num">2</div><div class="sbody"><b>Robar.</b> Roba 1 carta (−1 vida). En el turno 1 no robas.</div></div>
<div class="step"><div class="num">3</div><div class="sbody"><b>Fase principal.</b> Juega hasta 1 tierra. Lanza criaturas, conjuros, auras e instantáneos. Usa a Kael una vez.</div></div>
<div class="step"><div class="num">4</div><div class="sbody"><b>Combate.</b> Ataca con criaturas enderezadas que no tengan mareo de invocación. Vorthrax bloquea según sus reglas.</div></div>
<div class="step"><div class="num">5</div><div class="sbody"><b>Segunda fase principal.</b> Igual que el paso 3 (si aún no jugaste tierra o no usaste a Kael, todavía puedes).</div></div>
<div class="step"><div class="num">6</div><div class="sbody"><b>Final.</b> Descarta hasta quedarte con 5 cartas. El daño de las criaturas se borra.</div></div>
</div>
</div>
<div>
<h3>Turno de la Némesis</h3>
<div class="flow">
<div class="step"><div class="num n">1</div><div class="sbody"><b>Enderezar.</b> Alza todas las criaturas de la Némesis.</div></div>
<div class="step"><div class="num n">2</div><div class="sbody"><b>Ejecutar el Presagio.</b> Una criatura entra en la Mesa (con mareo de invocación salvo que tenga Prisa). Un hechizo se resuelve y va boca abajo al fondo.</div></div>
<div class="step"><div class="num n">3</div><div class="sbody"><b>Revelar un nuevo Presagio.</b> Voltea boca arriba la siguiente carta boca abajo (−1 vida de Vorthrax). Ya sabes qué hará el próximo turno.</div></div>
<div class="step"><div class="num n">4</div><div class="sbody"><b>Atacar.</b> Sus criaturas atacan según las reglas de la Némesis. Tú bloqueas y puedes lanzar instantáneos.</div></div>
<div class="step"><div class="num n">5</div><div class="sbody"><b>Final.</b> Resuelve las habilidades de final de turno (Rescoldo / Infierno). El daño se borra.</div></div>
</div>
</div>
</div>
<div class="cols" style="margin-top:3mm">
<div class="box mini"><h3>Instantáneos y respuestas</h3>Puedes lanzar instantáneos en cualquier momento, también durante el turno de la Némesis. Cuando la Némesis ejecuta un hechizo,
primero se elige su objetivo y después puedes responder antes de que se resuelva. La Némesis nunca te responde.</div>
<div class="box mini"><h3>Desbordamiento</h3>Si el Presagio es una criatura pero la Némesis ya tiene 4, la nueva criatura te hace un daño igual a su fuerza
y después va boca abajo al fondo del mazo de Amenaza.</div>
</div>
`, 11));
  pages.push(page(`
<h2>Combate y la Mente de la Némesis</h2>
<div class="cols">
<div>
<h3>Cómo funciona el combate</h3>
<ol>
<li><b>Atacar:</b> el atacante baja sus criaturas atacantes. Siguen bajadas hasta el siguiente enderezar de su dueño, así que <b>las criaturas que atacan no pueden bloquear en el turno siguiente</b>.</li>
<li><b>Bloquear:</b> cada defensor enderezado puede bloquear a un atacante. Cada atacante puede ser bloqueado por una criatura como máximo.</li>
<li><b>Trucos:</b> después de los bloqueos puedes lanzar instantáneos.</li>
<li><b>Daño:</b> todo a la vez. Cada criatura hace un daño igual a su fuerza. Los atacantes no bloqueados golpean al jugador o a la Némesis. Arrollar reparte el sobrante.</li>
<li><b>Muertes:</b> mueren las criaturas con daño igual o mayor que su resistencia.</li>
</ol>
<div class="box mini"><h3>Objetivos</h3>Los efectos de la Némesis que afectan a "tu criatura" eligen tu criatura de <b>mayor fuerza</b>; si hay empate, la de mayor resistencia y después la que esté más a la izquierda.
Si no tienes criaturas, el daño te lo hace a ti.</div>
</div>
<div>
<div class="box dark">
<h3>La Némesis ataca…</h3>
<p class="mini">Cada criatura de la Némesis enderezada, sin Defensor y sin mareo de invocación <b>ataca</b>, salvo que tengas una criatura enderezada
que pueda bloquearla, <b>matarla y sobrevivir</b>.</p>
<h3>La Némesis bloquea… (en este orden)</h3>
<ol class="mini">
<li><b>Bloqueo seguro.</b> Cada criatura de la Némesis enderezada que pueda bloquear a un atacante, matarlo y sobrevivir, lo hace, eligiendo el atacante de mayor fuerza que cumpla eso.</li>
<li><b>Intercambio.</b> Cada bloqueador restante bloquea al atacante de mayor fuerza que pueda matar, aunque muera.</li>
<li><b>Desesperación.</b> Si el daño sin bloquear dejaría a Vorthrax en 0, todos los bloqueadores restantes bloquean al atacante sin bloquear de mayor fuerza.</li>
<li><b>Empates:</b> elige primero la criatura de la Némesis que esté más a la izquierda.</li>
</ol>
</div>
<div class="box mini"><h3>Leer a la Némesis</h3>Como estas reglas son fijas, puedes predecir cada bloqueo. La habilidad está en dar forma al combate:
reforzar después de los bloqueos, eliminar primero al único bloqueador seguro o atacar justo con la criatura que no puede manejar.</div>
</div>
</div>
<h3>Ejemplo: un bloqueo seguro y luego un truco</h3>
${board("TU ATAQUE · TURNO 5 DE LA PARTIDA DE EJEMPLO", 12, 8, "Fase 1", "IV", "Dragoncillo de Ascuas", [chip("Demonio Abrasador", "4/3", "nem", undefined, "Arrollar")], [chip("Sabueso de Ceniza", "2/2", "you", true, "atacando"), chip("Saqueador Incendiario", "3/2", "you", true, "atacando")], [landChip("F"), landChip("M"), landChip("F")], 1)}
<p class="mini">El Demonio Abrasador puede matar al Sabueso y sobrevivir (2 &lt; 3), pero no al Saqueador (3 ≥ 3): <b>bloqueo seguro al Sabueso</b>. Respondes con Furia de Batalla: el Sabueso pasa a 5/2 y se lleva al Demonio por delante.</p>
`, 12));
  const ex1 = `
<h2>Partida de Ejemplo <small>vs. VORTHRAX</small></h2>
<p class="mini">Clan Ascua + Monteverde. Puedes seguirla con las cartas en la mano. Mano inicial: <b>Trasgo Temerario, Oso de la Espesura, Oleada de Vigor, Cuernochoque Ancestral</b>.
Primer Presagio: <b>Bruto Garrascua</b>. Tú: 20 vidas · Vorthrax: 14 vidas.</p>
<div class="round">RONDA 1</div>
${status(20, 14, "Fase 1", "I", "Bruto Garrascua")}
${turn("Turno 1 — Tú", "you", ["En el primer turno no robas.", "Tierra: volteas el <b>Cuernochoque Ancestral</b> a su lado de Bosque y lo metes detrás de Kael.", "No puedes lanzar nada: el Trasgo necesita {R} y el Oso necesita dos manás.", "Kael: <b>Cargar</b> (I → II). No hay criatura que reforzar, pero la lealtad sube."], "Una criatura de 5 manás en un mazo con 5 tierras como mucho es un sueño para más adelante. Las tierras ganan partidas ahora, y el Trasgo y el Oso son baratos.")}
${turn("Turno 1 — Vorthrax", "nem", ["Ejecuta el Presagio: entra el <b>Bruto Garrascua</b> (3/2), con mareo de invocación.", "Revela el nuevo Presagio: <b>Diablillo de Ceniza</b>. Vorthrax 14 → 13.", "No ataca. <b>Rescoldo</b>: 1 de daño, y la Descarga de Ascuas sale de tu biblioteca al cementerio. Tú 20 → 19."])}
${board("FINAL DE LA RONDA 1", 19, 13, "Fase 1", "II", "Diablillo de Ceniza<br>1/1 Volar", [chip("Bruto Garrascua", "3/2", "nem", undefined, "mareo")], [], [landChip("F")], 3)}
<div class="round">RONDA 2</div>
${status(19, 13, "Fase 1", "II", "Diablillo de Ceniza")}
${turn("Turno 2 — Tú", "you", ["Robas el <b>Sabueso de Ceniza</b> (19 → 18).", "El Presagio avisa de que llega un Diablillo de Ceniza (1/1 volador). El daño de entrada del Sabueso lo matará, así que <b>te guardas el Sabueso</b>.", "Tierra: Trasgo Temerario → Montaña. Lanzas el <b>Oso de la Espesura</b> {1}{G}.", "Kael: Cargar (II → III)."], "Leer el Presagio un turno antes te dice qué carta guardar. Esperar con el Sabueso lo convierte en un dos por uno el turno que viene.")}
${turn("Turno 2 — Vorthrax", "nem", ["Ejecuta el <b>Diablillo de Ceniza</b> (con mareo). Nuevo Presagio: <b>Aliento Abrasador</b>. 13 → 12.", "Comprobación de ataque: ¿podría tu Oso bloquear al Bruto, matarlo <i>y sobrevivir</i>? Lo mata, pero muere → <b>el Bruto ataca</b>.", "Bloqueas con el Oso. Mueren los dos: el Oso va a tu cementerio y el Bruto a la Ruina.", "Rescoldo: pierdes el Trasgo Temerario. 18 → 17."], "Tus tierras siguen bajadas porque las usaste para el Oso, así que no puedes lanzar Oleada de Vigor. Un Oso de 2 manás por un Bruto de fuerza 3 es buen cambio.")}
`;
  pages.push(page(ex1, 13, "dense"));
  const ex2 = `
${board("FINAL DE LA RONDA 2", 17, 12, "Fase 1", "III", "Aliento Abrasador<br>2 de daño a tu mejor criatura", [chip("Diablillo de Ceniza", "1/1", "nem", undefined, "Volar")], [], [landChip("F", true), landChip("M", true)], 2)}
<div class="round">RONDA 3</div>
${status(17, 12, "Fase 1", "III", "Aliento Abrasador")}
${turn("Turno 3 — Tú", "you", ["Robas <b>Fuerza Salvaje</b> (17 → 16). Tierra: Fuerza Salvaje → Bosque (3 tierras).", "Lanzas el <b>Sabueso de Ceniza</b> {1}{R}: su daño de entrada mata al Diablillo de Ceniza → Ruina.", "Kael: Cargar (III → IV).", "Dejas <b>un Bosque alzado</b>: viene un Aliento Abrasador y tienes Oleada de Vigor en la mano."], "Dejar maná libre a propósito es la esencia del juego con instantáneos. El Presagio lo convierte en una decisión calculada, no en una apuesta.")}
${turn("Turno 3 — Vorthrax", "nem", ["Ejecuta el <b>Aliento Abrasador</b>: el objetivo es tu criatura de mayor fuerza, el Sabueso.", "Respondes con <b>Oleada de Vigor</b> {G}. El Sabueso pasa a 5/5 y aguanta los 2 de daño sin problema.", "El Aliento Abrasador va boca abajo al fondo del mazo de Amenaza: 12 → 13. Nuevo Presagio: <b>Demonio Abrasador</b>: 13 → 12.", "No hay atacantes. Rescoldo: pierdes el Oso de la Espesura. 16 → 15."])}
${board("FINAL DE LA RONDA 3", 15, 12, "Fase 1", "IV", "Demonio Abrasador<br>4/3 Arrollar", [], [chip("Sabueso de Ceniza", "2/2", "you")], [landChip("F", true), landChip("M", true), landChip("F", true)], 0)}
<div class="round">RONDA 4</div>
${status(15, 12, "Fase 1", "IV", "Demonio Abrasador")}
${turn("Turno 4 — Tú", "you", ["Robas el <b>Saqueador Incendiario</b> (15 → 14). Es tu única carta, así que este turno no juegas tierra.", "Lanzas el Saqueador {2}{R} (3/2 con Prisa).", "Atacas con el Sabueso y el Saqueador. No hay bloqueadores: 5 de daño, la <b>Piel de Ceniza</b> previene 2 → 3 de daño.", "El Centinela de Magma, el Heraldo de Vorthrax y la Lluvia de Pavesas van a la Ruina. 12 → 9.", "Kael se queda en IV: una Definitiva ahora perdería 2 de sus 3 puntos de daño por la Piel de Ceniza."], "La Piel de Ceniza solo absorbe los 2 primeros puntos de daño de cada turno. Golpéala con todo a la vez y guarda la Definitiva para cuando la coraza caiga.")}
`;
  pages.push(page(ex2, 14, "dense"));
  const ex3 = `
${turn("Turno 4 — Vorthrax", "nem", ["Ejecuta el <b>Demonio Abrasador</b> (4/3 Arrollar), con mareo. Nuevo Presagio: <b>Dragoncillo de Ascuas</b>. 9 → 8.", "No hay atacantes. Rescoldo: pierdes el Jabalí Lomomusgo. 14 → 13."])}
${board("FINAL DE LA RONDA 4", 13, 8, "Fase 1", "IV", "Dragoncillo de Ascuas<br>2/2 Volar", [chip("Demonio Abrasador", "4/3", "nem", undefined, "Arrollar")], [chip("Sabueso de Ceniza", "2/2", "you", true), chip("Saqueador Incendiario", "3/2", "you", true)], [landChip("F", true), landChip("M", true), landChip("F", true)], 0)}
<div class="round">RONDA 5</div>
${status(13, 8, "Fase 1", "IV", "Dragoncillo de Ascuas")}
${turn("Turno 5 — Tú", "you", ["Robas <b>Furia de Batalla</b> (13 → 12). Atacas con el Sabueso (2/2) y el Saqueador (3/2).", "Bloqueo de la Némesis, paso 1 (bloqueo seguro): el Demonio Abrasador puede matar al Sabueso y sobrevivir, pero no al Saqueador → <b>bloquea al Sabueso</b>.", "Tras los bloqueos: <b>Furia de Batalla</b> {R} sobre el Sabueso → 5/2. El Sabueso y el Demonio se matan entre sí.", "El Saqueador no está bloqueado: 3 de daño − 2 (Piel de Ceniza) = 1. El Bruto Garrascua va a la Ruina. 8 → 7.", "<b>¡FASE 2!</b> Vorthrax se voltea. <b>Reavivar</b> devuelve boca abajo las 3 últimas cartas de la Ruina (Bruto Garrascua, Demonio Abrasador, Lluvia de Pavesas): 7 → 10. La Piel de Ceniza desaparece.", "Segunda fase principal: <b>DEFINITIVA</b> de Kael (IV → I): 3 de daño completos. 10 → 7."], "La paciencia en IV ha dado fruto: la Definitiva ha llegado justo el turno en que se rompió la coraza. Han contado los 3 puntos de daño.")}
${turn("Turno 5 — Vorthrax (Fase 2)", "nem", ["Ejecuta el <b>Dragoncillo de Ascuas</b> (2/2 Volar). Infierno le da Prisa. Nuevo Presagio: <b>Centinela de Magma</b>. 7 → 6.", "Tu Saqueador está bajado porque atacó: nadie puede bloquear. El Dragoncillo golpea por 2 y pierdes Floración Vital y Draco Alaceniza. 12 → 10.", "<b>Infierno</b>: 2 de daño más; pierdes Prender y el Druida Cantoarboleda. 10 → 8."], "La Fase 2 te cuesta 3 o 4 vidas por ronda. Además, el daño ha quemado una Floración Vital que te habría encantado robar. Empieza la carrera.")}
${board("FINAL DE LA RONDA 5", 8, 6, "Fase 2", "I", "Centinela de Magma<br>1/4 Defensor", [chip("Dragoncillo de Ascuas", "2/2", "nem", true, "Volar")], [chip("Saqueador Incendiario", "3/2", "you", true)], [landChip("F"), landChip("M", true), landChip("F")], 0)}
`;
  pages.push(page(ex3, 15, "dense"));
  const ex4 = `
<div class="round">RONDA 6</div>
${status(8, 6, "Fase 2", "I", "Centinela de Magma")}
${turn("Turno 6 — Tú", "you", ["Robas la <b>Araña del Dosel</b> (8 → 7). La lanzas {1}{G}: una 1/4 con Alcance para frenar al Dragoncillo.", "Kael: Cargar (I → II): el Saqueador obtiene +1/+0 → 4/2.", "Atacas con el Saqueador. El Dragoncillo está bajado (atacó), así que no hay bloqueadores: 4 de daño. 6 → 2."])}
${turn("Turno 6 — Vorthrax", "nem", ["Ejecuta el <b>Centinela de Magma</b> (1/4 Defensor). Nuevo Presagio: <b>Demonio Abrasador</b>, el que trajo de vuelta Reavivar. 2 → 1.", "Comprobación de ataque del Dragoncillo: tu Araña sobreviviría, pero no puede matarlo → <b>el Dragoncillo ataca</b>. Bloqueas con la Araña y no muere nadie.", "Infierno: pierdes Rugido Volcánico y Titán de la Pira. 7 → 5."], "El próximo turno, un Demonio Abrasador con Prisa (4 arrollando) más Infierno (2) suman 6 de daño. Después de robar tendrás 4 vidas. Este es tu último turno.")}
${board("FINAL DE LA RONDA 6", 5, 1, "Fase 2", "II", "Demonio Abrasador<br>4/3 Arrollar", [chip("Dragoncillo de Ascuas", "2/2", "nem", true, "Volar"), chip("Centinela de Magma", "1/4", "nem", undefined, "Defensor")], [chip("Saqueador Incendiario", "3/2", "you", true), chip("Araña del Dosel", "1/4", "you", undefined, "Alcance")], [landChip("F", true), landChip("M", true), landChip("F")], 0)}
<div class="round">RONDA 7</div>
${status(5, 1, "Fase 2", "II", "Demonio Abrasador")}
${turn("Turno 7 — Tú", "you", ["Robas el <b>Guardabosques Élfico</b> (5 → 4). Atacas con el Saqueador (3/2) y la Araña (1/4).", "Bloqueos de la Némesis: paso 1, el Centinela no puede matar a ninguno. Paso 2, no hay intercambio posible. Paso 3, <b>desesperación</b>: 4 de daño sin bloquear acabarían con Vorthrax, así que el Centinela bloquea al atacante de mayor fuerza, el Saqueador.", "La Araña no está bloqueada: 1 de daño. La Lluvia de Pavesas, la última carta boca abajo de Vorthrax, va a la Ruina. 1 → 0.", "<b>VICTORIA</b>, con 4 cartas en tu biblioteca."])}
<div class="box dark">
<h3>Resumen: cinco decisiones que ganaron el duelo</h3>
<ol class="mini" style="margin:0">
<li><b>El Cuernochoque como tierra</b> en el turno 1: ritmo antes que una carta soñada.</li>
<li><b>Guardar el Sabueso</b> para el Diablillo que anunciaba el Presagio.</li>
<li><b>Dejar un Bosque alzado</b> para salvar al Sabueso del Aliento Abrasador.</li>
<li><b>Esperar en IV</b> hasta que se rompió la Piel de Ceniza, y entonces una Definitiva con todo su daño.</li>
<li><b>La Araña</b>: bloqueadora en su turno y golpe final en el tuyo.</li>
</ol>
</div>
`;
  pages.push(page(ex4, 16, "dense"));
  const gallery = [...EMBERKIN, ...WILDWOOD].map((c) => renderCard(c, "xs")).join("");
  pages.push(page(`
<h2>Galería de Cartas <small>LAS 20 CARTAS DISTINTAS DEL GRIMORIO</small></h2>
<div class="row center" style="gap:2.5mm; padding:0 2mm">${gallery}</div>
<p class="cap" style="margin-top:3mm">Dos filas de arriba: Clan Ascua (rojo). Dos filas de abajo: Monteverde (verde). Trasgo Temerario, Descarga de Ascuas, Oso de la Espesura y Oleada de Vigor vienen con dos copias.</p>
`, 17));
  pages.push(page(`
<h2>Modos, otras Némesis y Ajustes</h2>
<div class="cols">
<div>
<h3>Modo Heroico</h3>
<p>Gira 180° la carta de la Némesis durante la preparación. Su mitad Heroica añade: <b>las criaturas de la Némesis obtienen +1/+0</b>. Cada bloqueo seguro pasa a ser un intercambio.</p>
<h3>Puzle en solitario</h3>
<p class="mini">Pon las 6 primeras Amenazas en un orden conocido e intenta ganar en el menor número de turnos posible. Compara tu récord.</p>
</div>
<div>
<h3>El Desafío (campaña)</h3>
<ol class="mini">
<li>Enfréntate a tres Némesis seguidas con el mismo Grimorio.</li>
<li>Tras cada victoria, mira 3 cartas al azar de un medio grimorio que no estés usando y cambia una de ellas por una de tu Grimorio.</li>
<li>Tu vida se reinicia entre duelos. Si pierdes una vez, el Desafío termina.</li>
</ol>
</div>
</div>
<h3>Próximas Némesis</h3>
<div class="row" style="gap:5mm; flex-wrap:nowrap; align-items:center">
${otherNemesis("Morwen, la Reina Liche", "💀", "black", "<b>DIEZMO DE TUMBA</b> — Al final de cada turno, si la Ruina tiene 3+ criaturas, devuelve a la Mesa la de mayor fuerza.", "<b>MARCHITEZ</b> — Tus criaturas obtienen −1/−1.")}
${otherNemesis("El Archimago Espejo", "🪞", "blue", "<b>REFRACCIÓN</b> — El primer hechizo que lanzas cada turno cuesta " + pips("{1}") + " más.", "<b>GUARDA ESPECULAR</b> — El primer hechizo que lanzas cada turno se contrarresta salvo que pagues " + pips("{2}") + ".")}
<div class="box" style="flex:1">
<p><b>Vorthrax</b> es agresivo: te gana la carrera con Prisa y daño directo.</p>
<p><b>Morwen</b> es desgaste: sus criaturas muertas vuelven una y otra vez, así que eliminar criaturas no basta.</p>
<p style="margin:0"><b>El Archimago Espejo</b> es control: encarece y contrarresta tus hechizos, y premia las cartas baratas y el farol con las tierras.</p>
</div>
</div>
<div class="box">
<h3>Notas de diseño: palancas de ajuste para el playtest</h3>
<table style="margin:1mm 0 0">
<tr><th>Palanca</th><th>Valor inicial</th><th>Súbela si…</th><th>Bájala si…</th></tr>
<tr><td>Tamaño del mazo de Amenaza</td><td>15 (14 vidas)</td><td>ganas antes de la ronda 5</td><td>nunca llegas a la Fase 2</td></tr>
<tr><td>Piel de Ceniza</td><td>2 por turno</td><td>la agresión temprana es demasiado fuerte</td><td>la Fase 1 parece un muro</td></tr>
<tr><td>Rescoldo / Infierno</td><td>1 / 2</td><td>ganas con 10+ vidas</td><td>pierdes antes de lanzar 4 hechizos</td></tr>
<tr><td>Mano inicial</td><td>4</td><td>a menudo te faltan tierras</td><td>los turnos 1–2 parecen guionizados</td></tr>
<tr><td>Reavivar</td><td>3 cartas</td><td>la Fase 2 dura un turno</td><td>la Fase 2 se eterniza</td></tr>
</table>
</div>
`, 18));
  const head = "<tr><th>#</th><th>Nombre</th><th>Coste</th><th>Tipo</th><th>F/R</th><th>Texto</th></tr>";
  pages.push(page(`
<h2>Listas de Cartas</h2>
<h3>Clan Ascua (rojo) · dorso: Montaña</h3>
<table class="lists">${head}${cardListRows(EMBERKIN)}</table>
<h3>Monteverde (verde) · dorso: Bosque</h3>
<table class="lists">${head}${cardListRows(WILDWOOD)}</table>
<h3>Mazo de Amenaza de Vorthrax</h3>
<table class="lists">${head}${cardListRows(VORTHRAX_THREATS)}</table>
`, 19, "dense"));
  pages.push(page(`
<h2>Referencia Rápida</h2>
<div class="quickref cols">
<div>
<div class="box"><h3>Tu turno</h3><ol>
<li>Enderezar (alza todo).</li><li>Robar 1 (−1 vida; no en el turno 1).</li>
<li>Principal: 1 tierra, hechizos, Kael una vez.</li><li>Combate.</li><li>Segunda principal.</li><li>Final: mano ≤ 5, el daño se borra.</li></ol></div>
<div class="box"><h3>Turno de la Némesis</h3><ol>
<li>Enderezar.</li><li>Ejecutar el Presagio.</li><li>Revelar un nuevo Presagio (−1 vida).</li><li>Atacar (tú bloqueas; se permiten instantáneos).</li><li>Habilidad de final de turno. El daño se borra.</li></ol></div>
<div class="box"><h3>Ganar y perder</h3><ol>
<li>Vorthrax no tiene Amenazas boca abajo → <b>ganas</b>.</li><li>Tu biblioteca tiene 0 cartas → <b>pierdes</b>.</li></ol></div>
</div>
<div>
<div class="box dark"><h3>Mente de la Némesis</h3><ol>
<li><b>Ataca</b> con toda criatura capaz, salvo que puedas bloquearla, matarla y sobrevivir.</li>
<li><b>Bloquea:</b> seguro → intercambio → desesperación (solo si es letal).</li>
<li><b>Objetivo:</b> tu criatura de mayor fuerza (luego resistencia, luego la de más a la izquierda); si no hay, tú.</li>
<li><b>Desbordamiento:</b> la 5.ª criatura te golpea por su fuerza.</li></ol></div>
<div class="box"><h3>Manos</h3><ol>
<li><b>Bajada</b> = girada. <b>Alzada</b> = enderezada.</li>
<li><b>Daño N</b>: N cartas de la biblioteca → cementerio.</li>
<li><b>Ganar N</b>: N cartas del cementerio → fondo de la biblioteca.</li>
<li><b>Golpear a Vorthrax N</b>: N cartas de detrás del Presagio → Ruina.</li></ol></div>
<div class="box"><h3>Kael</h3><ol>
<li>Cargar +1 · Descargar −2 (III–IV) · Definitiva (IV → I).</li>
<li>Una vez por turno, en una fase principal.</li></ol></div>
</div>
</div>
`, 20));
  return pages;
}
