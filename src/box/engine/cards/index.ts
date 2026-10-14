import type { CardDef } from '../types';
import { adamantWill } from './adamant_will';
import { aggressiveMammoth } from './aggressive_mammoth';
import { ajanisPridemate } from './ajanis_pridemate';
import { ancestorDragon } from './ancestor_dragon';
import { angelicEdict } from './angelic_edict';
import { arcaneEpiphany } from './arcane_epiphany';
import { battleRattleShaman } from './battle_rattle_shaman';
import { bearCub } from './bear_cub';
import { beastKinRanger } from './beast_kin_ranger';
import { bigfinBouncer } from './bigfin_bouncer';
import { biogenicUpgrade } from './biogenic_upgrade';
import { bishopsSoldier } from './bishops_soldier';
import { biteDown } from './bite_down';
import { bloodtitheCollector } from './bloodtithe_collector';
import { brinebornCutthroat } from './brineborn_cutthroat';
import { brokenWings } from './broken_wings';
import { burrogBefuddler } from './burrog_befuddler';
import { cancel } from './cancel';
import { carnelianOrbOfDragonkind } from './carnelian_orb_of_dragonkind';
import { catToken } from './cat_token';
import { cemeteryRecruitment } from './cemetery_recruitment';
import { clinquantSkymage } from './clinquant_skymage';
import { corsairCaptain } from './corsair_captain';
import { crosswayTroublemakers } from './crossway_troublemakers';
import { crowOfDarkTidings } from './crow_of_dark_tidings';
import { dazzlingAngel } from './dazzling_angel';
import { deadlyPlot } from './deadly_plot';
import { deadlyRiposte } from './deadly_riposte';
import { deathBaron } from './death_baron';
import { diregrafGhoul } from './diregraf_ghoul';
import { dragonFodder } from './dragon_fodder';
import { dragonlordsServant } from './dragonlords_servant';
import { dropkickBomber } from './dropkick_bomber';
import { druidOfTheCowl } from './druid_of_the_cowl';
import { dwynensElite } from './dwynens_elite';
import { eatenAlive } from './eaten_alive';
import { eatenByPiranhas } from './eaten_by_piranhas';
import { elfWarriorToken } from './elf_warrior_token';
import { elspethsSmite } from './elspeths_smite';
import { elvishArchdruid } from './elvish_archdruid';
import { elvishRegrower } from './elvish_regrower';
import { eruditeWizard } from './erudite_wizard';
import { exclusionMage } from './exclusion_mage';
import { faerieToken } from './faerie_token';
import { felidarSavior } from './felidar_savior';
import { fellingBlow } from './felling_blow';
import { fieryAnnihilation } from './fiery_annihilation';
import { fireElemental } from './fire_elemental';
import { firespitterWhelp } from './firespitter_whelp';
import { fleetingDistraction } from './fleeting_distraction';
import { forest } from './forest';
import { frenziedGoblin } from './frenzied_goblin';
import { giantGrowth } from './giant_growth';
import { goblinFirebomb } from './goblin_firebomb';
import { goblinOriflamme } from './goblin_oriflamme';
import { goblinSmuggler } from './goblin_smuggler';
import { goblinToken } from './goblin_token';
import { helpfulHunter } from './helpful_hunter';
import { heraldOfFaith } from './herald_of_faith';
import { herosDownfall } from './heros_downfall';
import { highbornVampire } from './highborn_vampire';
import { hinterlandSanctifier } from './hinterland_sanctifier';
import { hungryGhoul } from './hungry_ghoul';
import { icewindElemental } from './icewind_elemental';
import { incineratingBlast } from './incinerating_blast';
import { ingeniousLeonin } from './ingenious_leonin';
import { inspiringOverseer } from './inspiring_overseer';
import { intoTheRoil } from './into_the_roil';
import { island } from './island';
import { jazalGoldmane } from './jazal_goldmane';
import { joragaInvocation } from './joraga_invocation';
import { karganDragonrider } from './kargan_dragonrider';
import { kindledFury } from './kindled_fury';
import { kitesailCorsair } from './kitesail_corsair';
import { leoninSkyhunter } from './leonin_skyhunter';
import { leoninVanguard } from './leonin_vanguard';
import { llanowarElves } from './llanowar_elves';
import { maalfeldTwins } from './maalfeld_twins';
import { magnigothSentry } from './magnigoth_sentry';
import { mildManneredLibrarian } from './mild_mannered_librarian';
import { mischievousMystic } from './mischievous_mystic';
import { momentOfCraving } from './moment_of_craving';
import { momentOfTriumph } from './moment_of_triumph';
import { mountain } from './mountain';
import { mysticArchaeologist } from './mystic_archaeologist';
import { newHorizons } from './new_horizons';
import { offerImmortality } from './offer_immortality';
import { opt } from './opt';
import { pacifism } from './pacifism';
import { piratesCutlass } from './pirates_cutlass';
import { plains } from './plains';
import { prayerOfBinding } from './prayer_of_binding';
import { pridefulParent } from './prideful_parent';
import { quickDrawKatana } from './quick_draw_katana';
import { quickStudy } from './quick_study';
import { ragingRedcap } from './raging_redcap';
import { rapaciousDragon } from './rapacious_dragon';
import { reassemblingSkeleton } from './reassembling_skeleton';
import { savannahLions } from './savannah_lions';
import { scorchingDragonfire } from './scorching_dragonfire';
import { seizeTheSpoils } from './seize_the_spoils';
import { skeletonArcher } from './skeleton_archer';
import { skyrakerGiant } from './skyraker_giant';
import { skyshipBuccaneer } from './skyship_buccaneer';
import { snakeskinVeil } from './snakeskin_veil';
import { spectralSailor } from './spectral_sailor';
import { starlightSnare } from './starlight_snare';
import { stormFleetSpy } from './storm_fleet_spy';
import { stromkirkBloodthief } from './stromkirk_bloodthief';
import { suspiciousShambler } from './suspicious_shambler';
import { swabGoblin } from './swab_goblin';
import { swamp } from './swamp';
import { tajuruPathwarden } from './tajuru_pathwarden';
import { terrorOfMountVelus } from './terror_of_mount_velus';
import { thornwealdArcher } from './thornweald_archer';
import { thrashingBrontodon } from './thrashing_brontodon';
import { tolarianTerror } from './tolarian_terror';
import { treasureToken } from './treasure_token';
import { twinbladePaladin } from './twinblade_paladin';
import { unchartedHaven } from './uncharted_haven';
import { undyingMalice } from './undying_malice';
import { untamedHunger } from './untamed_hunger';
import { vampireInterloper } from './vampire_interloper';
import { vampireNeonate } from './vampire_neonate';
import { vampireSpawn } from './vampire_spawn';
import { vengefulBloodwitch } from './vengeful_bloodwitch';
import { volleyVeteran } from './volley_veteran';
import { wildheartInvoker } from './wildheart_invoker';
import { wildwoodScourge } from './wildwood_scourge';
import { zombieToken } from './zombie_token';

export const CORE_CARDS: CardDef[] = [
  adamantWill,
  aggressiveMammoth,
  ajanisPridemate,
  ancestorDragon,
  angelicEdict,
  arcaneEpiphany,
  battleRattleShaman,
  bearCub,
  beastKinRanger,
  bigfinBouncer,
  biogenicUpgrade,
  bishopsSoldier,
  biteDown,
  bloodtitheCollector,
  brinebornCutthroat,
  brokenWings,
  burrogBefuddler,
  cancel,
  carnelianOrbOfDragonkind,
  catToken,
  cemeteryRecruitment,
  clinquantSkymage,
  corsairCaptain,
  crosswayTroublemakers,
  crowOfDarkTidings,
  dazzlingAngel,
  deadlyPlot,
  deadlyRiposte,
  deathBaron,
  diregrafGhoul,
  dragonFodder,
  dragonlordsServant,
  dropkickBomber,
  druidOfTheCowl,
  dwynensElite,
  eatenAlive,
  eatenByPiranhas,
  elfWarriorToken,
  elspethsSmite,
  elvishArchdruid,
  elvishRegrower,
  eruditeWizard,
  exclusionMage,
  faerieToken,
  felidarSavior,
  fellingBlow,
  fieryAnnihilation,
  fireElemental,
  firespitterWhelp,
  fleetingDistraction,
  forest,
  frenziedGoblin,
  giantGrowth,
  goblinFirebomb,
  goblinOriflamme,
  goblinSmuggler,
  goblinToken,
  helpfulHunter,
  heraldOfFaith,
  herosDownfall,
  highbornVampire,
  hinterlandSanctifier,
  hungryGhoul,
  icewindElemental,
  incineratingBlast,
  ingeniousLeonin,
  inspiringOverseer,
  intoTheRoil,
  island,
  jazalGoldmane,
  joragaInvocation,
  karganDragonrider,
  kindledFury,
  kitesailCorsair,
  leoninSkyhunter,
  leoninVanguard,
  llanowarElves,
  maalfeldTwins,
  magnigothSentry,
  mildManneredLibrarian,
  mischievousMystic,
  momentOfCraving,
  momentOfTriumph,
  mountain,
  mysticArchaeologist,
  newHorizons,
  offerImmortality,
  opt,
  pacifism,
  piratesCutlass,
  plains,
  prayerOfBinding,
  pridefulParent,
  quickDrawKatana,
  quickStudy,
  ragingRedcap,
  rapaciousDragon,
  reassemblingSkeleton,
  savannahLions,
  scorchingDragonfire,
  seizeTheSpoils,
  skeletonArcher,
  skyrakerGiant,
  skyshipBuccaneer,
  snakeskinVeil,
  spectralSailor,
  starlightSnare,
  stormFleetSpy,
  stromkirkBloodthief,
  suspiciousShambler,
  swabGoblin,
  swamp,
  tajuruPathwarden,
  terrorOfMountVelus,
  thornwealdArcher,
  thrashingBrontodon,
  tolarianTerror,
  treasureToken,
  twinbladePaladin,
  unchartedHaven,
  undyingMalice,
  untamedHunger,
  vampireInterloper,
  vampireNeonate,
  vampireSpawn,
  vengefulBloodwitch,
  volleyVeteran,
  wildheartInvoker,
  wildwoodScourge,
  zombieToken,
];
