const openStax = 'https://openstax.org/books/anatomy-and-physiology-2e/pages/';
const chapters = {
  skull: '7-2-the-skull',
  spine: '7-3-the-vertebral-column',
  ribs: '7-4-the-thoracic-cage',
  arm: '8-2-bones-of-the-upper-limb',
  pelvis: '8-3-the-pelvic-girdle-and-pelvis',
  leg: '8-4-bones-of-the-lower-limb',
  joints: '9-6-anatomy-of-selected-synovial-joints',
  back: '11-3-axial-muscles-of-the-head-neck-and-back',
  wall: '11-4-axial-muscles-of-the-abdominal-wall-and-thorax',
  shoulder: '11-5-muscles-of-the-pectoral-girdle-and-upper-limbs',
  lower: '11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs',
  brain: '13-2-the-central-nervous-system',
  nerves: '13-4-the-peripheral-nervous-system',
  senses: '14-1-sensory-perception',
  heart: '19-1-heart-anatomy',
  vessels: '20-5-circulatory-pathways',
  spleen: '21-1-anatomy-of-the-lymphatic-and-immune-systems',
  breathing: '22-1-organs-and-structures-of-the-respiratory-system',
  lungs: '22-2-the-lungs',
  mouth: '23-3-the-mouth-pharynx-and-esophagus',
  stomach: '23-4-the-stomach',
  intestine: '23-5-the-small-and-large-intestines',
  digestiveOrgans: '23-6-accessory-organs-in-digestion-the-liver-pancreas-and-gallbladder',
  bladder: '25-2-gross-anatomy-of-urine-transport',
  kidney: '25-3-gross-anatomy-of-the-kidney',
  reproductive: '27-1-anatomy-and-physiology-of-the-testicular-reproductive-system',
};

const trapeziusStudy = 'https://pubmed.ncbi.nlm.nih.gov/23916077/';
const scapulaStudy = 'https://www.jstage.jst.go.jp/article/jpts/27/5/27_jpts-2014-759/_article';
const fasciaLecture = 'https://contents.kocw.or.kr/KOCW/document/2015/chungnam/kimdongwoon/1.pdf';
const cerebellumAtlas = 'https://www.ajnr.org/content/ajnr/11/1/41.full.pdf';

function anatomy(chapter, location, role) {
  return { location, role, source: chapters[chapter] ? openStax + chapters[chapter] : chapter };
}

const kidneyRole = '혈액에서 노폐물을 걸러 소변을 만들고 체액의 양과 전해질 농도를 조절합니다.';
const handDigits = anatomy('arm', '손허리뼈 끝에서 손가락 끝까지 이어지는 마디뼈입니다.', '관절과 힘줄이 마디뼈를 움직여 손을 쥐고 물체를 조작할 수 있게 합니다.');
const footDigits = anatomy('leg', '발허리뼈와 발가락 끝 사이에 놓인 마디뼈입니다.', '디딜 때 지면을 지지하고 발뒤꿈치가 들릴 때 몸을 앞으로 밀어내는 데 참여합니다.');

export const groupDetails = {
  'head-neck': anatomy('skull', '머리뼈와 턱 아래에서 시작해 목뼈를 따라 가슴 위쪽까지 이어집니다.', '머리뼈가 뇌를 보호하고, 목뼈가 머리를 받치며 고개를 돌리고 기울일 수 있게 합니다.'),
  chest: anatomy('ribs', '목 아래와 가로막 사이에 있으며, 갈비뼈가 심장과 폐 주위를 둘러쌉니다.', '갈비우리가 장기를 보호합니다. 폐는 기체를 교환하고 심장은 혈액을 순환시킵니다.'),
  abdomen: anatomy('digestiveOrgans', '가로막과 골반 사이입니다. 간과 위는 윗배에 있고 콩팥은 배 뒤쪽에 놓입니다.', '위와 장은 음식물을 처리합니다. 간과 이자는 소화와 대사에, 콩팥은 체액 조절에 관여합니다.'),
  'back-spine': anatomy('spine', '몸통 뒤쪽 정중앙과 그 양옆입니다.', '척추가 머리와 몸통을 지지하고 척수를 보호합니다. 등 근육이 척추와 어깨뼈의 움직임에 관여합니다.'),
  pelvis: anatomy('pelvis', '허리뼈 아래에서 좌우 엉덩관절 사이에 놓입니다.', '몸통의 하중을 다리로 전달하며 골반 안 장기를 둘러쌉니다.'),
  'left-arm': anatomy('arm', '인체의 왼쪽 어깨에서 손끝까지 이어집니다.', '어깨와 팔꿈치가 손의 위치를 정하고 손목과 손가락이 물체를 잡고 조작합니다.'),
  'right-arm': anatomy('arm', '인체의 오른쪽 어깨에서 손끝까지 이어집니다.', '어깨와 팔꿈치가 손의 위치를 정하고 손목과 손가락이 물체를 잡고 조작합니다.'),
  'left-leg': anatomy('leg', '인체의 왼쪽 엉덩관절에서 발끝까지 이어집니다.', '체중을 받치고 서기, 걷기, 균형 유지에 관여합니다.'),
  'right-leg': anatomy('leg', '인체의 오른쪽 엉덩관절에서 발끝까지 이어집니다.', '체중을 받치고 서기, 걷기, 균형 유지에 관여합니다.'),
  body_arteries: anatomy('vessels', '대동맥과 폐동맥을 시작으로 머리, 몸통, 팔다리에 가지가 분포합니다.', '심장에서 나온 혈액을 폐 또는 몸의 조직으로 보냅니다.'),
  body_veins: anatomy('vessels', '머리, 몸통, 팔다리와 폐에 분포하며 여러 가지가 더 큰 정맥으로 모입니다.', '폐나 몸을 지난 혈액을 심장 쪽으로 되돌립니다.'),
  skull: anatomy('skull', '이마, 머리의 위·옆·뒤와 바닥을 이루는 뼈입니다.', '뇌와 감각기관을 보호하며 목뼈와 만나 머리를 지지합니다.'),
  jaw: anatomy('skull', '얼굴 아래와 양옆에 있는 위턱뼈, 아래턱뼈, 광대뼈 일대입니다.', '치아를 받치고 얼굴의 윤곽을 형성합니다. 아래턱은 관절을 통해 씹는 방향으로 움직입니다.'),
  teeth: anatomy('mouth', '위턱과 아래턱의 치아가 치조에 배열됩니다.', '앞니는 자르고, 송곳니는 찢으며, 작은어금니와 큰어금니는 음식물을 부수고 갑니다.'),
  brain: anatomy('brain', '머리뼈 안의 대뇌 반구 깊숙한 곳과 척수 위쪽입니다.', '대뇌 백질은 뇌 영역 사이 신호를 전달합니다. 뇌줄기는 뇌와 척수를 연결하고 호흡 등 여러 자동 기능에 관여합니다.'),
  frontal_cortex: anatomy('brain', '대뇌의 앞쪽에서 중심고랑 앞까지 이어지는 겉질입니다.', '수의 운동, 계획과 행동 조절에 관여하는 여러 영역을 포함합니다.'),
  parietal_cortex: anatomy('brain', '중심고랑 뒤쪽에서 대뇌의 위쪽과 안쪽으로 이어지는 겉질입니다.', '몸에서 전달된 감각을 처리하고 공간 관계를 파악하는 데 관여합니다.'),
  temporal_cortex: anatomy('brain', '가쪽고랑 아래에서 대뇌의 가쪽과 아래쪽을 이루는 겉질입니다.', '청각과 언어 정보의 처리에 관여하는 영역을 포함합니다.'),
  occipital_cortex: anatomy('brain', '대뇌 반구의 가장 뒤쪽 겉질입니다.', '눈에서 전달된 정보의 형태, 위치 등 시각 특징을 처리합니다.'),
  cerebellum: anatomy('brain', '큰뇌 뒤아래쪽, 뇌줄기 뒤에 있습니다.', '움직임의 타이밍과 정확도를 조절하고 균형과 자세 유지에 기여합니다.'),
  eyes: anatomy('senses', '머리뼈 앞쪽의 눈확 안에 있습니다.', '눈에서 빛을 모아 망막에 상을 맺히게 하고, 망막이 빛을 신경 신호로 바꿉니다.'),
  ears: anatomy('senses', '관자뼈에 둘러싸인 가운데귀와 속귀의 일부입니다.', '귓속뼈는 진동을 전달하고, 달팽이관은 진동을 청각 신호로 바꿉니다.'),
  cranial_nerves: anatomy('nerves', '대뇌 또는 뇌줄기에서 시작해 얼굴, 눈, 코와 귀로 이어지는 신경 일부입니다.', '종류에 따라 감각을 전달하거나 얼굴 근육의 운동과 분비를 조절합니다.'),
  bronchial_tree_left: anatomy('breathing', '왼 주기관지가 왼폐 안에서 두 폐엽을 향해 갈라집니다.', '폐엽기관지와 구역기관지는 들숨과 날숨의 공기를 각 폐엽과 구역에 전달합니다.'),
  bronchial_tree_right: anatomy('breathing', '오른 주기관지가 오른폐 안에서 세 폐엽을 향해 갈라집니다.', '폐엽기관지와 구역기관지는 들숨과 날숨의 공기를 각 폐엽과 구역에 전달합니다.'),
  cervical_spine: anatomy('spine', '머리뼈와 등뼈 사이에 있는 일곱 목뼈(C1–C7)입니다.', '머리를 받치며 목의 운동을 허용합니다. 가운데 통로는 척수를 둘러쌉니다.'),
  thoracic_spine: anatomy('spine', '목뼈 아래, 허리뼈 위에 위치한 열두 등뼈(T1–T12)입니다.', '갈비뼈와 관절을 이루어 갈비우리 뒤쪽을 구성하며 몸통을 지지합니다.'),
  lumbar_spine: anatomy('spine', '등뼈와 엉치뼈 사이의 다섯 허리뼈(L1–L5)입니다.', '큰 척추뼈몸통으로 상체의 하중을 받고 허리 굽힘과 폄에 참여합니다.'),
  sacrum: anatomy('spine', '허리뼈 아래, 좌우 볼기뼈 사이의 엉치뼈와 그 아래 꼬리뼈입니다.', '엉치뼈는 척추의 하중을 골반으로 전달합니다. 꼬리뼈에는 골반저 근육과 인대 일부가 붙습니다.'),
  neck_muscles: anatomy('back', '목빗근은 목 양옆, 머리곧은근은 머리와 첫째 목뼈 사이에 놓입니다.', '고개를 굽히고 돌리며 머리와 목의 자세를 안정시키는 데 관여합니다.'),
  superficial_back: anatomy(trapeziusStudy, '목 뒤와 등 표면의 얕은층입니다. 등세모근은 등 위쪽, 넓은등근은 등 아래쪽과 옆에 펼쳐집니다.', '등세모근(승모근)은 어깨뼈를 움직이고 안정시킵니다. 넓은등근(광배근)은 위팔을 몸통 쪽과 뒤로 당기는 데 관여합니다.'),
  deep_back: anatomy('back', '등의 표면 근육보다 깊은 척추 양옆과 허리 뒤쪽입니다.', '뭇갈래근(다열근)은 인접 척추 분절을 안정시키고, 허리네모근(요방형근)은 허리를 옆으로 굽히는 데 관여합니다.'),
  spinal_dura: anatomy('brain', '척추관 안에서 척수와 신경뿌리 주변을 둘러싸는 가장 바깥쪽 뇌척수막입니다.', '질긴 보호막을 이루어 척수 주변 내용물을 보호합니다.'),
  larynx: anatomy('breathing', '인두 아래, 기관 위의 목 앞쪽에 있습니다.', '공기가 지나가는 통로이며 소리를 냅니다. 음식을 삼킬 때 아래 기도를 보호하는 데 관여합니다.'),
  tongue: anatomy('mouth', '입안 바닥에 있고 뒤쪽 뿌리가 인두를 향합니다.', '음식물을 움직여 삼킬 덩이를 만들고, 맛을 느끼고 말소리를 내는 데 관여합니다.'),
  left_lung: anatomy('lungs', '심장의 왼쪽, 왼쪽 갈비우리 안의 위엽과 아래엽입니다.', '폐포에서 공기와 혈액 사이에 산소와 이산화탄소가 교환됩니다.'),
  right_lung: anatomy('lungs', '심장의 오른쪽, 오른쪽 갈비우리 안의 위엽·중간엽·아래엽입니다.', '각 엽의 폐포에서 산소와 이산화탄소가 교환됩니다.'),
  heart_chambers: anatomy('heart', '두 폐 사이의 심장 안에 있는 좌우 심방과 심실입니다.', '심방은 들어오는 혈액을 받고, 심실은 혈액을 폐 또는 전신으로 내보냅니다.'),
  rib_cage: anatomy('ribs', '가슴뼈와 갈비연골이 앞쪽에 있고 갈비뼈가 등뼈에서부터 양옆을 감쌉니다.', '심장과 폐를 보호하며 호흡할 때 가슴우리의 부피 변화에 기여합니다.'),
  diaphragm: anatomy('wall', '가슴과 배 사이에 놓인 돔 모양의 근육입니다.', '숨을 들이쉴 때 수축하여 아래로 내려가고 가슴 공간을 넓힙니다.'),
  trachea: anatomy('breathing', '후두 아래에서 시작해 가슴 위쪽에서 좌우 주기관지로 갈라집니다.', '공기를 폐로 전달합니다. 연골이 통로를 지탱합니다.'),
  bronchus_left: anatomy('breathing', '기관이 갈라지는 지점부터 왼쪽 폐문까지 이어집니다.', '왼쪽 폐로 공기를 보내며 폐 안에서 엽기관지로 나뉩니다.'),
  bronchus_right: anatomy('breathing', '기관이 갈라지는 지점부터 오른쪽 폐문까지 이어집니다.', '오른쪽 폐로 공기를 보내며 폐 안에서 엽기관지로 나뉩니다.'),
  esophagus: anatomy('mouth', '목에서 기관 뒤쪽을 지나 가슴과 가로막을 통과해 위로 연결됩니다.', '벽의 연동 운동으로 삼킨 음식물을 위로 보냅니다.'),
  heart_internal: anatomy('heart', '심장의 혈액 통로에 위치한 판막과 심실 안쪽 벽에 붙은 유두근입니다.', '판막은 혈액이 일정한 방향으로 흐르도록 돕습니다. 유두근은 힘줄끈을 통해 심방과 심실 사이 판막을 받칩니다.'),
  great_vessels: anatomy('vessels', '가슴 중앙의 심장과 척추 주변에 있는 대동맥 구간과 폐동맥줄기입니다.', '대동맥은 왼심실의 혈액을 몸으로, 폐동맥줄기는 오른심실의 혈액을 폐 쪽으로 보냅니다.'),
  liver: anatomy('digestiveOrgans', '가로막 바로 아래의 오른쪽 윗배에 걸쳐 있습니다.', '쓸개즙을 만들고, 혈액의 영양소와 여러 물질을 처리합니다.'),
  gallbladder: anatomy('digestiveOrgans', '간 아래면에 붙은 작은 주머니입니다.', '간에서 만든 쓸개즙을 저장하고 농축한 뒤 소장에 내보냅니다.'),
  stomach: anatomy('stomach', '식도 아래와 십이지장 사이입니다. 주로 왼쪽 윗배에 놓입니다.', '음식물을 저장하고 섞으며 위액을 이용해 단백질 소화를 시작합니다.'),
  pancreas: anatomy('digestiveOrgans', '위 뒤쪽에서 십이지장 굽이부터 비장 쪽까지 가로로 뻗습니다.', '소화 효소와 중탄산염을 소장에 보냅니다. 인슐린과 글루카곤을 분비해 혈당 조절에도 관여합니다.'),
  spleen: anatomy('spleen', '왼쪽 윗배에서 위의 뒤가쪽에 놓입니다.', '혈액을 여과하여 오래된 적혈구를 제거하고 혈액 속 항원에 대한 면역 반응을 돕습니다.'),
  small_intestine: anatomy('intestine', '위에서 이어지는 십이지장과 그다음 구간인 공장이 포함됩니다.', '소화액과 음식물을 섞고, 소화된 영양소를 흡수합니다.'),
  colon: anatomy('intestine', '오른쪽 배를 올라가 윗배를 가로지른 뒤 왼쪽 배를 내려가 골반 쪽으로 이어집니다.', '내용물에서 물과 전해질을 흡수하고 대변을 형성합니다.'),
  sigmoid: anatomy('intestine', '내림결장과 직장 사이에서 골반 쪽으로 휘어지는 결장의 끝 구간입니다.', '대변을 직장 쪽으로 이동시키는 통로입니다.'),
  left_kidney: anatomy('kidney', '복막 뒤에서 허리뼈의 왼쪽에 놓입니다.', kidneyRole),
  right_kidney: anatomy('kidney', '복막 뒤에서 허리뼈의 오른쪽에 놓입니다. 대체로 왼쪽 콩팥보다 낮습니다.', kidneyRole),
  abdominal_aorta: anatomy('vessels', '가로막 아래에서 허리뼈 앞을 따라 내려가 양쪽 온엉덩동맥으로 갈라집니다.', '복부 장기, 몸통 벽, 골반과 다리로 가는 혈액의 주요 통로입니다.'),
  inferior_vena_cava: anatomy('vessels', '복부 대동맥 오른쪽을 따라 올라가 가로막을 통과합니다.', '몸통 아래쪽과 다리에서 돌아오는 혈액을 오른심방으로 보냅니다.'),
  abdominal_wall: anatomy('wall', '배 앞가쪽을 감싸는 배곧은근과 배바깥빗근·배속빗근·배가로근입니다.', '몸통 운동을 일으키고 복압을 조절하며 배 안의 장기를 지지합니다.'),
  rectus_abdominis: anatomy('wall', '배 앞 가운데 양옆에서 두덩뼈와 위쪽 갈비연골·가슴뼈 부위를 잇습니다.', '몸통을 앞으로 굽히고 배 안의 압력을 높이는 데 참여합니다.'),
  external_abdominal_oblique: anatomy('wall', '배 가쪽의 표면층으로, 섬유가 대체로 앞아래쪽을 향합니다.', '양쪽이 함께 수축하면 몸통 굽힘을 돕고, 한쪽 수축은 몸통 반대쪽 회전에 기여합니다.'),
  internal_abdominal_oblique: anatomy('wall', '배바깥빗근 아래에 놓인 배 가쪽 근육입니다.', '배 안의 압력을 높이고, 한쪽 수축은 같은 쪽 몸통 회전에 기여합니다.'),
  transversus_abdominis: anatomy('wall', '배 가쪽 근육 중 깊은 층에 있고 섬유가 대체로 가로 방향으로 놓입니다.', '배 안의 내용물을 압박하고 몸통을 안정시키는 데 관여합니다.'),
  transversalis_fascia: anatomy(fasciaLecture, '배가로근 안쪽을 덮는 결합조직층입니다.', '복벽 깊은 면을 이루며 샅굴 주변 구조와 연속됩니다.'),
  pelvic_bones: anatomy('pelvis', '엉치뼈 양옆의 볼기뼈를 포함하며 양쪽 엉덩관절을 이룹니다.', '체중을 다리로 전달하고 골반 안 장기를 둘러싸며 근육의 부착점을 제공합니다.'),
  pelvic_floor: anatomy('wall', '골반 안쪽의 가장 아래에서 근육성 바닥을 이룹니다.', '골반 장기를 받치고 배 안 압력이 증가할 때 아래쪽을 지지합니다.'),
  pelvic_wall: anatomy('lower', '골반의 가쪽과 뒤쪽 벽을 따라 놓인 근육입니다.', '골반을 지나 넙다리뼈에 닿는 근육은 엉덩관절을 움직이고 안정시키는 데 관여합니다.'),
  bladder: anatomy('bladder', '골반 앞쪽의 방광과 그 아래로 이어지는 요도입니다.', '방광은 소변을 저장하고 요도는 배뇨할 때 몸 밖으로 소변을 내보냅니다.'),
  male_glands: anatomy('reproductive', '방광 아래의 전립샘과 방광 뒤쪽의 정낭을 포함합니다.', '정자의 이동과 생존을 돕는 정액의 일부 성분을 분비합니다.'),
  male_reproductive: anatomy('reproductive', '골반 아래와 회음부 주변에 놓인 고환, 부고환 등의 구조입니다.', '고환은 정자와 호르몬을 만들고 부고환은 정자의 성숙과 저장에 관여합니다.'),
  pelvic_nerves: anatomy('nerves', '골반 안쪽에서 회음부 쪽으로 이어지는 말초신경 묶음입니다.', '회음부의 감각을 전달하며 일부 골반저 근육과 조임근의 운동에 관여합니다.'),
  shoulder: anatomy('arm', '몸통 위쪽 가쪽에서 빗장뼈와 어깨뼈가 어깨대를 이룹니다.', '팔을 몸통과 연결하고 팔을 움직일 때 어깨관절의 바탕이 됩니다.'),
  upper_arm: anatomy('arm', '어깨관절과 팔꿈치 사이에 있는 위팔뼈입니다.', '어깨와 팔꿈치 관절을 이루며 여러 팔 근육에 지렛대를 제공합니다.'),
  forearm: anatomy('arm', '엄지 쪽 노뼈와 새끼손가락 쪽 자뼈가 팔꿈치에서 손목까지 이어집니다.', '노뼈가 자뼈를 기준으로 움직이면서 손바닥을 위아래로 돌릴 수 있습니다.'),
  wrist: anatomy('arm', '아래팔과 손허리뼈 사이에 작은 손목뼈 여덟 개가 두 줄로 배열됩니다.', '손목의 여러 방향 운동을 나누어 맡으며 손에 실리는 힘을 아래팔로 전달합니다.'),
  palm: anatomy('arm', '손목뼈와 손가락뼈 사이의 손허리뼈입니다.', '손바닥의 뼈대를 만들고 손가락을 굽히고 뻗거나 벌릴 때 지지점이 됩니다.'),
  hand_digit_1: handDigits, hand_digit_2: handDigits, hand_digit_3: handDigits,
  hand_digit_4: handDigits, hand_digit_5: handDigits,
  shoulder_joints: anatomy('joints', '어깨뼈의 관절오목 둘레에서 위팔뼈 머리를 감쌉니다.', '관절오목을 깊게 만들어 넓게 움직이는 어깨관절의 안정성에 기여합니다.'),
  elbow_joints: anatomy('joints', '팔꿈치의 위팔뼈·자뼈·노뼈 관절 주변에 놓인 인대입니다.', '팔꿈치가 굽히고 펴질 때 관절 양옆을 지지합니다.'),
  shoulder_muscles: anatomy('shoulder', '어깨뼈와 위팔뼈 위쪽 주변을 둘러쌉니다.', '팔을 들어 올리거나 회전시키고, 돌림근띠는 위팔뼈 머리가 관절오목에 놓이도록 돕습니다.'),
  upper_arm_muscles: anatomy('shoulder', '위팔뼈 앞과 뒤에 놓이며 일부는 어깨 또는 팔꿈치를 지납니다.', '위팔 앞쪽 근육은 팔꿈치 굽힘에, 뒤쪽 위팔세갈래근은 폄에 관여합니다.'),
  forearm_muscles: anatomy('shoulder', '아래팔뼈 주변에서 손목을 건너가는 힘줄과 이어집니다.', '손목과 손가락의 굽힘·폄에 참여하고 손을 쥘 때 손목을 안정시킵니다.'),
  hand_muscles: anatomy('shoulder', '손바닥 안쪽과 손허리뼈 주변에 있는 근육입니다.', '손가락을 섬세하게 조절해 물체를 잡거나 놓도록 돕습니다.'),
  arm_nerves: anatomy('nerves', '겨드랑이에서 시작해 위팔과 아래팔, 손까지 이어지는 말초신경입니다.', '팔과 손의 감각 정보를 전달하고 여러 근육의 운동을 조절합니다.'),
  arm_arteries: anatomy('vessels', '겨드랑이 쪽에서 위팔로 내려온 뒤 아래팔에서 노·자동맥으로 이어집니다.', '팔과 손의 근육과 다른 조직에 혈액을 공급합니다.'),
  hip: anatomy('pelvis', '몸통과 넙다리가 만나는 골반 가쪽의 볼기뼈 부분입니다.', '넙다리뼈 머리와 엉덩관절을 이루어 체중을 지지하고 다리의 여러 방향 움직임을 허용합니다.'),
  thigh: anatomy('leg', '엉덩관절과 무릎 사이의 넙다리뼈입니다.', '서거나 걸을 때 힘을 전달하며 다리 근육이 당기는 지렛대가 됩니다.'),
  knee: anatomy('joints', '넙다리뼈와 정강뼈 사이에 반달연골과 인대가 있고, 앞쪽에 무릎뼈가 놓입니다.', '반달연골은 하중을 분산하고 인대는 뼈의 과도한 이동을 제한합니다. 무릎뼈는 무릎을 펴는 힘을 전달합니다.'),
  shank: anatomy('leg', '무릎과 발목 사이에서 안쪽에 정강뼈, 가쪽에 종아리뼈가 놓입니다.', '정강뼈는 체중을 주로 받으며 종아리뼈는 발목 지지와 근육 부착에 기여합니다.'),
  ankle: anatomy('leg', '정강뼈 아래부터 발허리뼈 바로 앞까지 이어지는 발목뼈입니다.', '발과 종아리 사이에 하중을 전달하고 지면에 맞춰 발의 방향을 조절합니다.'),
  foot: anatomy('leg', '발목뼈와 발가락 사이의 다섯 발허리뼈입니다.', '발의 앞쪽을 지지하며 걷는 동안 체중을 발가락 쪽으로 전달합니다.'),
  foot_digit_1: footDigits, foot_digit_2: footDigits, foot_digit_3: footDigits,
  foot_digit_4: footDigits, foot_digit_5: footDigits,
  hip_muscles: anatomy('lower', '골반 가쪽과 뒤쪽에서 넙다리뼈 위쪽으로 이어집니다.', '엉덩관절을 움직이며 한 발로 지지할 때 골반을 안정시키는 데 관여합니다.'),
  thigh_muscles: anatomy('lower', '넙다리 앞, 뒤, 안쪽의 근육입니다.', '무릎을 펴거나 굽히고, 엉덩관절에서 다리를 몸통 쪽 또는 뒤쪽으로 움직이는 데 관여합니다.'),
  shank_muscles: anatomy('lower', '정강뼈와 종아리뼈 주변에 있으며 아킬레스힘줄은 뒤꿈치뼈에 닿습니다.', '발목과 발가락을 움직입니다. 종아리 뒤쪽 근육은 아킬레스힘줄을 통해 발뒤꿈치를 들어 올립니다.'),
  foot_muscles: anatomy('lower', '발등 또는 발바닥에 놓이며 발 안의 뼈를 연결합니다.', '발가락 움직임을 조절하고, 서거나 걸을 때 발을 안정시키는 데 기여합니다.'),
  leg_nerves: anatomy('nerves', '볼기와 넙다리 뒤를 지나는 궁둥신경과 다리 아래쪽으로 이어지는 가지를 포함합니다.', '다리와 발의 일부 감각과 근육 운동 신호를 전달합니다.'),
  leg_arteries: anatomy('vessels', '넙다리의 넙다리동맥과 종아리의 종아리동맥 등입니다.', '다리와 발 조직에 산소와 영양분을 담은 혈액을 보냅니다.'),
};

function member(label, chapter, location, role) {
  return { label, ...anatomy(chapter, location, role) };
}

const memberDetails = {
  'Precentral gyrus': member('중심앞이랑', 'brain', '이마엽에서 중심고랑 바로 앞에 놓입니다.', '일차운동겉질이 위치하며 주로 반대쪽 몸의 수의 운동을 조절합니다.'),
  'Superior frontal gyrus': member('위이마이랑', 'brain', '이마엽의 위쪽에서 대뇌 안쪽 면까지 이어집니다.', '운동 준비와 주의 조절에 관여하는 여러 겉질 영역을 포함합니다.'),
  'Middle frontal gyrus': member('중간이마이랑', 'brain', '이마엽 가쪽에서 위이마이랑과 아래이마이랑 사이에 놓입니다.', '주의, 작업 기억과 행동 계획에 관여하는 영역을 포함합니다.'),
  'Orbital gyri': member('눈확이랑', 'brain', '이마엽 아래에서 눈확의 윗면과 가까운 이랑입니다.', '감각 정보와 결과를 비교해 판단하고 행동을 조절하는 데 관여합니다.'),
  'Postcentral gyrus': member('중심뒤이랑', 'brain', '마루엽에서 중심고랑 바로 뒤에 놓입니다.', '일차몸감각겉질이 위치하며 주로 반대쪽 몸의 촉각과 위치 감각을 처리합니다.'),
  'Superior parietal lobule': member('위마루소엽', 'brain', '마루속고랑 위에 놓이는 마루엽 겉질입니다.', '촉각·시각을 결합해 공간에서 몸과 물체의 위치를 파악하는 데 관여합니다.'),
  'Angular gyrus': member('모이랑', 'brain', '마루엽 가쪽의 뒤쪽에서 위관자고랑의 끝을 둘러쌉니다.', '시각, 언어 및 다른 감각 정보를 통합하는 데 관여합니다.'),
  'Supramarginal gyrus': member('모서리위이랑', 'brain', '마루엽 가쪽에서 가쪽고랑의 뒤끝을 둘러쌉니다.', '감각 정보 통합과 말소리 처리에 관여합니다.'),
  Precuneus: member('쐐기앞소엽', 'brain', '대뇌 안쪽의 마루엽에서 마루뒤통수고랑 앞에 놓입니다.', '공간 정보와 기억을 다루는 뇌 영역들과 함께 작용합니다.'),
  'Superior temporal gyrus (Lateral part)': member('위관자이랑 가쪽 부분', 'brain', '관자엽의 가쪽에서 가쪽고랑 바로 아래에 놓입니다.', '소리를 처리하고 일부 영역은 말소리 이해에 관여합니다.'),
  'Middle temporal gyrus': member('중간관자이랑', 'brain', '관자엽 가쪽에서 위관자이랑과 아래관자이랑 사이에 놓입니다.', '언어 의미와 시각 정보 처리에 관여하는 영역을 포함합니다.'),
  'Inferior temporal gyrus': member('아래관자이랑', 'brain', '관자엽 가쪽에서 중간관자이랑 아래쪽에 놓입니다.', '시각으로 본 물체를 구분하는 데 관여합니다.'),
  'Transverse temporal gyri': member('가로관자이랑 (헤슐이랑)', 'brain', '가쪽고랑 속에서 관자엽의 윗면을 가로지릅니다.', '일차청각겉질이 위치하며 소리의 기본 특징을 처리합니다.'),
  Cuneus: member('쐐기소엽', 'brain', '뒤통수엽 안쪽에서 새발톱고랑 위에 놓입니다.', '시각 정보를 처리하는 안쪽 겉질을 포함합니다.'),
  'Lingual gyrus': member('혀이랑', 'brain', '뒤통수엽 안쪽과 아래쪽에서 새발톱고랑 아래에 놓입니다.', '시각 형태를 처리하는 등 시각에 관여합니다.'),
  'Occipital pole': member('뒤통수극', 'brain', '대뇌 반구의 뒤쪽 끝입니다.', '중심 시야 정보가 투영되는 뒤통수엽 영역에 인접합니다.'),
  'Superior occipital gyri': member('위뒤통수이랑', 'brain', '뒤통수엽의 가쪽 윗부분을 이룹니다.', '다른 뒤통수엽 영역과 함께 시각 정보를 처리합니다.'),
  Iris: member('홍채', 'senses', '각막 뒤, 수정체 앞에서 동공을 둘러쌉니다.', '동공 크기를 바꿔 눈으로 들어오는 빛의 양을 조절합니다.'),
  Retina: member('망막', 'senses', '안구 뒤쪽 벽의 가장 안쪽 층입니다.', '광수용세포로 빛을 감지하고 시각신경으로 전달되는 신호를 만듭니다.'),
  'Olfactory nerve (I)': member('후각신경 (제1뇌신경)', 'nerves', '코안 위쪽의 후각 상피에서 체판을 지나 후각망울에 닿습니다.', '냄새 자극을 후각망울로 전달합니다.'),
  'Optic nerve (II)': member('시각신경 (제2뇌신경)', 'nerves', '안구 뒤쪽에서 시각신경관을 지나 시각교차 쪽으로 이어집니다.', '망막에서 발생한 시각 신호를 뇌로 전달합니다.'),
  'Trigeminal nerve (V)': member('삼차신경 (제5뇌신경)', 'nerves', '다리뇌 가쪽에서 나와 얼굴로 이르는 여러 가지로 나뉩니다.', '얼굴의 주요 감각을 전달하고 씹는 근육을 조절합니다.'),
  'Facial nerve (VII)': member('얼굴신경 (제7뇌신경)', 'nerves', '다리뇌 아래쪽에서 관자뼈를 지나 얼굴로 이어집니다.', '표정 근육의 운동을 조절하며 미각 및 분비 신호도 전달합니다.'),
  'Vestibulocochlear nerve (VIII)': member('속귀신경 (제8뇌신경)', 'nerves', '속귀와 다리뇌 아래쪽 사이를 이어줍니다.', '청각과 평형 감각을 속귀에서 뇌줄기로 전달합니다.'),
  'Descending part of trapezius muscle': member('등세모근 내림부분 (승모근 위쪽)', trapeziusStudy,
    '뒤통수와 목 뒤에서 가쪽 빗장뼈 쪽으로 내려오는 섬유입니다.',
    '어깨대를 위로 받치고 팔을 들어 올릴 때 어깨뼈의 위쪽 회전에 협력합니다.'),
  'Transverse part of trapezius muscle': member('등세모근 가로부분 (승모근 가운데)', trapeziusStudy,
    '목 아래와 등 위쪽에서 어깨뼈 가시와 봉우리 쪽으로 가로로 이어집니다.',
    '어깨뼈를 척추 쪽으로 당기고 팔을 움직일 때 어깨뼈 위치를 안정시킵니다.'),
  'Ascending part of trapezius muscle': member('등세모근 오름부분 (승모근 아래쪽)', scapulaStudy,
    '등 아래쪽에서 어깨뼈 가시 안쪽 끝으로 비스듬히 올라가는 섬유입니다.',
    '어깨뼈를 아래쪽으로 당기고 팔을 올릴 때 어깨뼈의 위쪽 회전에 협력합니다.'),
  'Latissimus dorsi muscle': member('넓은등근 (광배근)', 'shoulder',
    '등 아래쪽과 옆면에 넓게 펼쳐져 겨드랑이 뒤쪽을 지나 위팔뼈에 닿습니다.',
    '위팔을 뒤로 펴고 몸통 쪽으로 모으며 안쪽으로 돌립니다.'),
  'Multifidus colli muscle': member('목 뭇갈래근 (다열근)', 'back',
    '목뼈 뒤쪽의 깊은 근육으로 여러 목뼈를 잇습니다.',
    '목의 작은 움직임을 제어하고 목뼈가 움직일 때 각 분절을 안정시킵니다.'),
  'Multifidus thoracis muscle': member('등 뭇갈래근 (다열근)', 'back',
    '등뼈 뒤쪽에서 여러 척추 분절을 비스듬히 연결합니다.',
    '등뼈를 안정시키며 몸통을 펴거나 돌릴 때 다른 근육과 함께 작용합니다.'),
  'Multifidus lumborum muscle': member('허리 뭇갈래근 (다열근)', 'back',
    '허리뼈와 엉치뼈 뒤쪽의 깊은 층에 놓입니다.',
    '허리뼈 사이의 작은 움직임을 조절하며 하중이 실릴 때 분절의 안정성을 돕습니다.'),
  'Quadratus lumborum muscle': member('허리네모근 (요방형근)', 'back',
    '엉덩뼈능선 위에서 허리뼈 가로돌기와 가장 아래 갈비뼈 사이를 잇습니다.',
    '한쪽이 수축하면 몸통이 같은 쪽으로 기울어집니다. 아래쪽 갈비뼈를 안정시키는 데에도 관여합니다.'),
  'Atlas (C1)': member('고리뼈 (C1)', 'spine', '머리뼈 바로 아래에 있는 첫째 목뼈입니다.', '뒤통수뼈와 만나 머리를 받치고 고개를 끄덕이는 움직임을 허용합니다.'),
  'Axis (C2)': member('중쇠뼈 (C2)', 'spine', '고리뼈 바로 아래에 있는 둘째 목뼈입니다.', '위로 솟은 치아돌기가 고리뼈가 돌아가는 축이 되어 머리 회전에 관여합니다.'),
  Sacrum: member('엉치뼈 (천골)', 'spine', '마지막 허리뼈와 꼬리뼈 사이에서 좌우 볼기뼈와 만납니다.', '몸통의 하중을 엉치엉덩관절을 통해 골반으로 전달합니다.'),
  Coccyx: member('꼬리뼈 (미골)', 'spine', '엉치뼈 바로 아래의 척추 끝에 있습니다.', '골반저 근육과 인대에 부착점을 제공합니다.'),
  'Left atrium': member('왼심방', 'heart', '심장의 왼쪽 위쪽 방으로, 폐정맥이 이어집니다.', '폐에서 돌아온 혈액을 받아 왼심실에 전달합니다.'),
  'Right atrium': member('오른심방', 'heart', '심장의 오른쪽 위쪽 방으로, 대정맥 등이 이어집니다.', '몸에서 돌아온 혈액을 받아 오른심실로 보냅니다.'),
  'Left ventricle': member('왼심실', 'heart', '심장의 왼쪽 아래쪽 두꺼운 벽으로 둘러싸인 방입니다.', '대동맥을 통해 혈액을 온몸으로 내보냅니다.'),
  'Right ventricle': member('오른심실', 'heart', '심장의 오른쪽 아래쪽 방으로 폐동맥줄기가 이어집니다.', '오른심방에서 받은 혈액을 폐로 보냅니다.'),
  'Superior lobe of left lung': member('왼쪽 폐 위엽', 'lungs', '왼쪽 폐 빗틈새 위에 있으며 심장에 인접합니다.', '폐포에서 산소와 이산화탄소를 교환합니다.'),
  'Inferior lobe of left lung': member('왼쪽 폐 아래엽', 'lungs', '왼쪽 폐 빗틈새 아래에서 가로막에 가까이 놓입니다.', '폐포에서 산소와 이산화탄소를 교환합니다.'),
  'Superior lobe of right lung': member('오른쪽 폐 위엽', 'lungs', '오른쪽 폐의 가장 위쪽입니다.', '폐포에서 산소와 이산화탄소를 교환합니다.'),
  'Middle lobe of right lung': member('오른쪽 폐 중간엽', 'lungs', '오른쪽 폐의 위엽과 아래엽 사이에서 가슴 앞쪽을 향합니다.', '폐포에서 산소와 이산화탄소를 교환합니다.'),
  'Inferior lobe of right lung': member('오른쪽 폐 아래엽', 'lungs', '오른쪽 폐의 아래와 뒤쪽에서 가로막과 접합니다.', '폐포에서 산소와 이산화탄소를 교환합니다.'),
  Duodenum: member('십이지장 (샘창자)', 'intestine', '위 바로 아래에서 이자 머리 주변을 굽어 지나는 소장의 첫 구간입니다.', '위에서 온 내용물에 쓸개즙과 이자액이 섞이는 곳입니다.'),
  Jejunum: member('공장 (빈창자)', 'intestine', '십이지장과 회장 사이로 주로 복부 중앙에 고리처럼 놓입니다.', '소화된 영양소와 물을 흡수합니다.'),
  'Ascending colon': member('오름결장', 'intestine', '복부 오른쪽에서 막창자부터 간 아래까지 올라갑니다.', '내용물을 가로결장으로 보내고 물과 전해질을 흡수합니다.'),
  'Transverse colon': member('가로결장', 'intestine', '윗배에서 오른쪽과 왼쪽을 가로지릅니다.', '내용물을 내림결장으로 옮기면서 수분과 전해질을 흡수합니다.'),
  'Descending colon': member('내림결장', 'intestine', '복부 왼쪽을 아래로 내려갑니다.', '내용물을 구불결장 쪽으로 옮기는 동안 물을 흡수합니다.'),
  'Sigmoid colon': { label: '구불결장 (S상 결장)', ...groupDetails.sigmoid },
  'Frontal bone': member('이마뼈', 'skull', '머리뼈 앞쪽에서 이마와 눈확의 지붕을 이룹니다.', '뇌의 앞쪽과 눈확 위쪽을 보호합니다.'),
  'Occipital bone': member('뒤통수뼈', 'skull', '머리 뒤와 바닥에 있으며 큰구멍을 포함합니다.', '뇌줄기와 척수가 이어지는 통로를 둘러싸고 고리뼈와 관절을 이룹니다.'),
  'Parietal bone': member('마루뼈', 'skull', '머리뼈의 위와 가쪽을 이루는 좌우 뼈입니다.', '머리덮개를 형성하여 대뇌를 보호합니다.'),
  'Temporal bone': member('관자뼈', 'skull', '머리뼈 가쪽 아래에서 귀 주위를 둘러쌉니다.', '가운데귀와 속귀를 보호하고 아래턱뼈와 턱관절을 이룹니다.'),
  'Sphenoid bone': member('나비뼈', 'skull', '머리뼈 바닥 중앙에서 눈확 뒤쪽에 펼쳐집니다.', '머리뼈의 여러 뼈를 연결하고 뇌하수체가 놓이는 오목한 자리를 만듭니다.'),
  'Ethmoid bone': member('벌집뼈', 'skull', '두 눈확 사이의 코안 위쪽에 놓입니다.', '코안과 눈확 일부를 구분하며 후각신경 섬유가 지나는 구멍을 포함합니다.'),
  'Zygomatic bone': member('광대뼈', 'skull', '눈확 바깥쪽 아래의 뺨에 놓입니다.', '얼굴 가쪽과 눈확 벽을 이루고 깨물근이 붙는 광대활에 참여합니다.'),
  Mandible: member('아래턱뼈', 'skull', '얼굴 아래에 있으며 관자뼈와 턱관절을 이룹니다.', '아래 치아를 지지하고 입을 여닫고 씹는 데 관여합니다.'),
  Maxilla: member('위턱뼈', 'skull', '얼굴 가운데에서 위 치아, 단단입천장 앞쪽과 눈확 바닥 일부를 이룹니다.', '위 치아를 지지하고 입안, 코안, 눈확의 경계를 형성합니다.'),
  'White matter of telencephalon': member('큰뇌 백질', 'brain', '큰뇌겉질 아래쪽에 놓인 신경섬유 영역입니다.', '겉질의 여러 영역 사이 또는 겉질과 다른 신경계 부위 사이에 신호를 전달합니다.'),
  Midbrain: member('중간뇌', 'brain', '사이뇌와 다리뇌 사이에 있는 뇌줄기의 윗부분입니다.', '눈의 움직임과 시각·청각 자극에 대한 반응 등 여러 기능에 관여합니다.'),
  Pons: member('다리뇌', 'brain', '중간뇌와 숨뇌 사이에서 소뇌 앞에 놓입니다.', '대뇌와 소뇌 사이의 신호를 중계하고 호흡 조절에 관여합니다.'),
  'Medulla oblongata': member('숨뇌 (연수)', 'brain', '다리뇌 아래에서 척수로 이어지는 뇌줄기의 아랫부분입니다.', '호흡과 심혈관계의 자율 조절 및 삼킴 같은 반사에 관여합니다.'),
  'Biventral lobule': member('두힘살소엽', cerebellumAtlas, '소뇌 반구 아랫면에서 아래반달소엽보다 앞쪽에 놓입니다.', '운동 정보를 처리하는 소뇌겉질의 한 구역입니다.'),
  'Superior semilunar lobule': member('위반달소엽', cerebellumAtlas, '소뇌 반구 뒤가쪽에서 수평틈새 위쪽에 놓입니다.', '소뇌 반구의 뒤엽을 구성하는 구역입니다.'),
  'Inferior semilunar lobule': member('아래반달소엽', cerebellumAtlas, '소뇌 반구 뒤가쪽에서 수평틈새 아래쪽에 놓입니다.', '소뇌 반구의 뒤엽을 이루며 위반달소엽과 틈새를 사이에 두고 이어집니다.'),
  'Anterior quadrangular lobule': member('앞네모소엽', cerebellumAtlas, '소뇌 위앞쪽에서 일차틈새 앞의 앞엽에 놓입니다.', '자세와 움직임에 관련된 신호가 처리되는 소뇌 앞엽의 일부입니다.'),
  Sclera: member('공막', 'senses', '눈알의 대부분을 둘러싸는 흰 바깥층입니다.', '눈알의 형태를 유지하고 내부를 보호합니다.'),
  Cornea: member('각막', 'senses', '눈알 맨 앞쪽에서 홍채와 동공 앞을 덮습니다.', '빛을 통과시키면서 굴절시켜 초점을 맞추는 데 크게 기여합니다.'),
  Lens: member('수정체', 'senses', '홍채와 동공 뒤쪽에 놓입니다.', '두께를 조절해 서로 다른 거리에 있는 물체의 상을 망막에 맺히게 합니다.'),
  'Vitreous body': member('유리체', 'senses', '수정체 뒤에서 망막까지 눈알 안의 큰 공간을 채웁니다.', '투명한 젤 형태로 눈알 내부를 채우고 빛이 망막에 도달하도록 합니다.'),
  Malleus: member('망치뼈', 'senses', '고막 안쪽에 붙은 첫 번째 귓속뼈입니다.', '고막의 진동을 모루뼈에 전달합니다.'),
  Incus: member('모루뼈', 'senses', '가운데귀에서 망치뼈와 등자뼈 사이에 있습니다.', '망치뼈에서 받은 진동을 등자뼈로 전달합니다.'),
  Stapes: member('등자뼈', 'senses', '모루뼈와 속귀의 안뜰창 사이에 놓입니다.', '가운데귀의 진동을 속귀의 액체로 전달합니다.'),
  Cochlea: member('달팽이관', 'senses', '관자뼈 안의 나선형 속귀 구조입니다.', '진동 때문에 움직이는 감각세포가 소리 신호를 뇌로 보냅니다.'),
  'Sternocleidomastoid muscle': member('목빗근 (흉쇄유돌근)', 'back', '가슴뼈·빗장뼈에서 귀 뒤쪽 꼭지돌기까지 비스듬히 이어집니다.', '한쪽이 수축하면 고개가 반대편으로 돌아가며, 양쪽은 목의 굽힘에 관여합니다.'),
  'Rectus anterior capitis muscle': member('앞머리곧은근', 'back', '첫째 목뼈와 뒤통수뼈 사이에서 머리밑관절 앞쪽에 놓입니다.', '머리를 가볍게 앞으로 굽히고 머리와 목 사이를 안정시킵니다.'),
  'Rectus lateralis capitis muscle': member('가쪽머리곧은근', 'back', '첫째 목뼈 가로돌기에서 뒤통수뼈 가쪽 아래까지 이어집니다.', '머리의 옆 기울임을 돕고 머리밑관절을 안정시킵니다.'),
  'Hyoid bone': member('목뿔뼈', 'breathing', '아래턱 뒤아래와 후두 위에 놓인 말굽 모양 뼈입니다.', '혀와 후두에 연결되는 근육을 지지하여 삼킴에 관여합니다.'),
  'Thyroid cartilage': member('방패연골 (갑상연골)', 'breathing', '후두 앞과 양옆을 둘러싸며 목 앞의 후두융기를 형성합니다.', '후두 안의 성대 등을 보호하고 성대가 부착되는 틀을 제공합니다.'),
  'Cricoid cartilage': member('반지연골 (윤상연골)', 'breathing', '방패연골 아래, 기관 바로 위에 고리 모양으로 놓입니다.', '후두 아래쪽 통로의 형태를 유지합니다.'),
  'Manubrium of sternum': member('가슴뼈자루', 'ribs', '가슴뼈 윗부분에서 빗장뼈와 위쪽 갈비연골이 만납니다.', '가슴우리 앞쪽과 어깨대를 연결하는 관절의 일부를 이룹니다.'),
  'Body of sternum': member('가슴뼈몸통', 'ribs', '가슴 중앙의 가슴뼈자루와 칼돌기 사이입니다.', '여러 갈비연골이 붙어 가슴우리 앞쪽을 지지합니다.'),
  'Xiphoid process': member('칼돌기', 'ribs', '가슴뼈의 가장 아래쪽에 있습니다.', '가로막과 일부 복벽 구조가 부착되는 지점입니다.'),
  'Ascending aorta': member('오름대동맥', 'vessels', '왼심실 위쪽에서 나와 대동맥활까지 올라갑니다.', '전신 순환의 시작 경로이며, 시작 부분에서 심장에 혈액을 공급하는 관상동맥이 나옵니다.'),
  'Thoracic aorta': member('가슴대동맥', 'vessels', '대동맥활 뒤에서 척추 앞쪽을 따라 가로막까지 내려갑니다.', '가슴 벽과 가슴 안의 여러 구조에 혈액을 공급하고 복부 대동맥으로 이어집니다.'),
  'Pulmonary trunk': member('폐동맥줄기', 'heart', '오른심실에서 나와 왼쪽과 오른쪽 폐동맥으로 갈라집니다.', '오른심실에서 나온 혈액을 양쪽 폐로 보냅니다.'),
  'Aortic arch': member('대동맥활', 'vessels', '심장 위에서 오름대동맥을 가슴대동맥과 연결하는 굽은 부분입니다.', '머리와 목, 양쪽 팔에 혈액을 보내는 큰 가지가 여기서 나옵니다.'),
  'Superior vena cava': member('위대정맥 (상대정맥)', 'vessels', '가슴 위쪽에서 오른심방으로 이어지는 큰 정맥입니다.', '머리와 목, 양팔과 몸통 위쪽에서 돌아오는 혈액을 오른심방으로 보냅니다.'),
  'Hip bone': member('볼기뼈 (관골)', 'pelvis', '골반 양옆의 뼈로 엉덩뼈·궁둥뼈·두덩뼈가 합쳐져 형성됩니다.', '엉치뼈에서 받은 체중을 넙다리뼈로 전달하고 엉덩관절의 오목한 부분을 이룹니다.'),
  'Pubic symphysis': member('두덩결합 (치골결합)', 'pelvis', '골반 앞쪽 가운데에서 양쪽 두덩뼈를 잇습니다.', '골반 고리 앞부분을 연결하며 작은 움직임과 힘의 전달을 허용합니다.'),
  'Pubococcygeus muscle': member('두덩꼬리근', 'wall', '두덩뼈 안쪽에서 골반저를 지나 뒤쪽을 향하는 항문올림근의 일부입니다.', '골반 장기를 지지하고 골반저의 압력 유지에 관여합니다.'),
  'Iliococcygeus muscle': member('엉덩꼬리근', 'wall', '골반 가쪽 벽 부근에서 꼬리뼈 쪽으로 이어지는 항문올림근의 일부입니다.', '골반 바닥을 받치고 배 안의 압력이 증가할 때 장기를 지탱합니다.'),
  'Coccygeus muscle': member('꼬리근', 'wall', '궁둥뼈가시 쪽과 엉치뼈·꼬리뼈 가쪽 사이에 놓입니다.', '골반저의 뒤쪽을 지지합니다.'),
  'Obturator internus': member('속폐쇄근', 'lower', '골반 가쪽 안면에서 시작해 골반 뒤쪽을 지나 넙다리뼈로 향합니다.', '넙다리를 가쪽으로 돌리고 엉덩관절을 안정시킵니다.'),
  'Piriformis muscle': member('궁둥구멍근 (이상근)', 'lower', '엉치뼈 앞에서 시작해 큰궁둥구멍을 지나 넙다리뼈로 이어집니다.', '엉덩관절의 가쪽 돌림과 안정화에 관여합니다.'),
  'Urinary bladder': member('방광', 'bladder', '골반 앞쪽의 두덩뼈 뒤에 놓입니다.', '콩팥에서 요관을 통해 내려온 소변을 모아 두었다가 배뇨 시 내보냅니다.'),
  Urethra: member('요도', 'bladder', '방광 아래에서 몸 밖의 요도구까지 이어집니다.', '배뇨 시 방광에서 나온 소변이 지나가는 통로입니다.'),
  Prostate: member('전립샘', 'reproductive', '방광 바로 아래에서 요도의 시작 부분을 둘러쌉니다.', '정액을 이루는 액체 성분의 일부를 분비합니다.'),
  'Seminal gland': member('정낭', 'reproductive', '방광 뒤쪽과 전립샘 위쪽에 있는 좌우 샘입니다.', '정자에 에너지를 제공하는 과당을 포함한 분비액을 만듭니다.'),
  Testis: member('고환', 'reproductive', '몸통 아래의 음낭 안에 위치합니다.', '정자와 테스토스테론을 만듭니다.'),
  Epididymis: member('부고환', 'reproductive', '고환의 뒤쪽을 따라 놓인 굽은 관입니다.', '고환에서 나온 정자가 성숙하고 이동할 때 지나는 통로입니다.'),
  'Pudendal nerve': member('음부신경', 'nerves', '골반 뒤쪽에서 회음부로 나가는 신경입니다.', '회음부 감각을 전달하고 일부 조임근과 회음부 근육을 조절합니다.'),
  Clavicle: member('빗장뼈', 'arm', '가슴뼈 윗부분에서 어깨뼈의 봉우리까지 뻗습니다.', '어깨를 몸통에서 일정 거리 떨어뜨려 지지하고 팔에서 들어오는 힘을 몸통으로 전달합니다.'),
  Scapula: member('어깨뼈', 'arm', '등 위쪽 갈비우리 뒤의 편평한 삼각형 뼈입니다.', '위팔뼈가 움직이는 관절오목과 어깨를 움직이는 근육의 부착점을 제공합니다.'),
  Radius: member('노뼈', 'arm', '해부학 자세에서 아래팔의 엄지 쪽에 놓입니다.', '자뼈 주위를 움직여 손바닥을 돌리고, 손을 통해 들어온 하중을 전달합니다.'),
  Ulna: member('자뼈', 'arm', '해부학 자세에서 아래팔의 새끼손가락 쪽에 놓입니다.', '위팔뼈와 맞물려 팔꿈치 굽힘과 폄의 주된 관절을 이룹니다.'),
  'Glenoid labrum': { label: '관절오목테두리', ...groupDetails.shoulder_joints },
  'Annular ligament of radius': member('노뼈머리띠인대', 'joints', '팔꿈치 가쪽에서 노뼈머리를 감쌉니다.', '노뼈머리를 자뼈 옆에 붙들면서 회전을 허용합니다.'),
  'Ulnar collateral ligament': member('자쪽곁인대', 'joints', '팔꿈치 안쪽에서 위팔뼈와 자뼈를 잇습니다.', '팔꿈치에 가쪽으로 벌어지는 힘이 가해질 때 안쪽을 안정시킵니다.'),
  'Acromial part of deltoid muscle': member('어깨세모근 봉우리부분 (삼각근 가쪽)', 'shoulder', '어깨뼈 봉우리에서 위팔뼈 가쪽으로 내려옵니다.', '팔을 몸통 옆으로 들어 올리는 데 크게 기여합니다.'),
  'Clavicular part of deltoid muscle': member('어깨세모근 빗장부분 (삼각근 앞쪽)', 'shoulder', '빗장뼈 가쪽에서 위팔뼈 앞가쪽으로 이어집니다.', '팔을 앞으로 들고 위팔의 안쪽 돌림을 돕습니다.'),
  'Scapular spinal part of deltoid muscle': member('어깨세모근 어깨뼈가시부분 (삼각근 뒤쪽)', 'shoulder', '어깨뼈 가시에서 위팔뼈 가쪽으로 이어집니다.', '팔을 뒤로 보내고 위팔의 가쪽 돌림을 돕습니다.'),
  'Supraspinatus muscle': member('가시위근 (극상근)', 'shoulder', '어깨뼈 가시 위에서 위팔뼈 머리 쪽으로 이어지는 돌림근띠 근육입니다.', '팔을 옆으로 드는 움직임을 시작하도록 돕고 관절을 안정시킵니다.'),
  'Infraspinatus muscle': member('가시아래근 (극하근)', 'shoulder', '어깨뼈 가시 아래의 뒤면에서 위팔뼈에 닿습니다.', '위팔을 가쪽으로 돌리고 어깨관절을 안정시킵니다.'),
  'Subscapularis muscle': member('어깨밑근 (견갑하근)', 'shoulder', '갈비뼈를 마주보는 어깨뼈 앞면에서 위팔뼈로 이어집니다.', '위팔을 안쪽으로 돌리고 어깨관절 앞쪽을 지지합니다.'),
  'Teres minor muscle': member('작은원근 (소원근)', 'shoulder', '어깨뼈 가쪽 모서리에서 위팔뼈 위쪽으로 향합니다.', '위팔을 가쪽으로 돌리고 돌림근띠의 일부로 관절을 안정시킵니다.'),
  'Long head of biceps brachii': member('위팔두갈래근 긴갈래 (상완이두근 장두)', 'shoulder', '어깨관절 위쪽에서 시작해 위팔 앞쪽을 지나 노뼈로 향합니다.', '팔꿈치를 굽히고 손바닥을 위로 돌리는 데 참여합니다.'),
  'Short head of biceps brachii': member('위팔두갈래근 짧은갈래 (상완이두근 단두)', 'shoulder', '어깨뼈 부리돌기에서 시작해 위팔 앞쪽을 지나 노뼈로 향합니다.', '팔꿈치 굽힘과 아래팔 뒤침에 긴갈래와 함께 작용합니다.'),
  'Brachialis muscle': member('위팔근', 'shoulder', '위팔두갈래근 아래에서 위팔뼈 앞면과 자뼈를 잇습니다.', '손바닥 방향과 관계없이 팔꿈치를 굽히는 데 기여합니다.'),
  'Brachioradialis muscle': member('위팔노근', 'shoulder', '위팔뼈 가쪽 아래부터 엄지 쪽 손목 부근의 노뼈까지 이어집니다.', '아래팔이 중간 방향에 있을 때 팔꿈치 굽힘을 돕습니다.'),
  'Extensor digitorum': member('손가락폄근', 'shoulder', '아래팔 뒤쪽에서 손등을 지나 손가락 힘줄로 이어집니다.', '주로 엄지를 제외한 네 손가락을 폅니다.'),
  'Flexor digitorum profundus': member('깊은손가락굽힘근', 'shoulder', '아래팔 앞쪽 깊은 층에서 손가락 끝마디뼈까지 힘줄이 이어집니다.', '엄지를 제외한 손가락의 끝마디를 굽히고 손을 쥐는 데 관여합니다.'),
  'Abductor pollicis brevis': member('짧은엄지벌림근', 'shoulder', '손바닥에서 엄지 밑두덩의 얕은 층에 놓입니다.', '엄지를 손바닥에서 앞으로 들어 올려 물체를 집을 때 필요한 벌림을 돕습니다.'),
  'Axillary nerve': member('겨드랑신경', 'nerves', '어깨 뒤쪽을 지나 위팔뼈 위쪽을 감쌉니다.', '어깨세모근과 작은원근의 운동, 어깨 가쪽 피부 일부의 감각에 관여합니다.'),
  'Median nerve': member('정중신경', 'nerves', '위팔과 아래팔 앞쪽을 지나 손목굴을 통과합니다.', '여러 손가락 굽힘근과 엄지 주변 근육을 조절하며 손바닥 일부의 감각을 전달합니다.'),
  'Ulnar nerve': member('자신경 (척골신경)', 'nerves', '팔꿈치 안쪽 뒤를 지나 새끼손가락 쪽 아래팔로 이어집니다.', '손의 여러 작은 근육을 조절하고 새끼손가락 쪽의 감각을 전달합니다.'),
  'Axillary artery': member('겨드랑동맥', 'vessels', '빗장밑동맥에서 이어져 겨드랑이를 통과한 뒤 위팔동맥으로 연결됩니다.', '어깨와 겨드랑이 주변 조직에 혈액을 보내고 팔 쪽 순환으로 이어집니다.'),
  'Brachial artery': member('위팔동맥', 'vessels', '위팔 안쪽을 지나 팔꿈치 부근에서 주로 노·자동맥으로 갈라집니다.', '위팔과 그 아래 부위에 가는 혈액이 지나는 주요 동맥입니다.'),
  'Radial artery': member('노동맥', 'vessels', '아래팔의 엄지 쪽에서 손목과 손으로 이어집니다.', '아래팔 가쪽과 손에 혈액을 공급합니다.'),
  'Ulnar artery': member('자동맥', 'vessels', '아래팔의 새끼손가락 쪽을 지나 손바닥으로 들어갑니다.', '아래팔 안쪽과 손에 혈액을 공급하고 손바닥 동맥활에 참여합니다.'),
  Patella: member('무릎뼈 (슬개골)', 'leg', '무릎 앞에서 넙다리네갈래근 힘줄 속에 놓입니다.', '힘줄의 지렛팔을 늘려 무릎을 펴는 힘이 효율적으로 전달되게 합니다.'),
  'Anterior cruciate ligament': member('앞십자인대', 'joints', '무릎 관절 안에서 넙다리뼈와 정강뼈를 비스듬히 연결합니다.', '정강뼈가 넙다리뼈에 비해 과도하게 앞으로 이동하는 것을 제한합니다.'),
  'Posterior cruciate ligament': member('뒤십자인대', 'joints', '무릎 관절 안에서 앞십자인대 뒤에 교차하여 놓입니다.', '정강뼈가 넙다리뼈에 비해 과도하게 뒤로 이동하는 것을 제한합니다.'),
  'Medial meniscus': member('안쪽 반달연골', 'joints', '무릎 안쪽에서 넙다리뼈와 정강뼈 사이에 놓입니다.', '접촉 면적을 넓혀 하중을 분산하고 관절 움직임을 돕습니다.'),
  'Lateral meniscus': member('가쪽 반달연골', 'joints', '무릎 바깥쪽에서 넙다리뼈와 정강뼈 사이에 놓입니다.', '무릎 가쪽의 하중을 분산하고 관절 접촉을 돕습니다.'),
  Tibia: member('정강뼈', 'leg', '무릎에서 발목까지 이어지는 종아리 안쪽의 굵은 뼈입니다.', '다리 아래쪽으로 체중을 전달하고 무릎·발목관절을 이룹니다.'),
  Fibula: member('종아리뼈', 'leg', '정강뼈 가쪽을 따라 나란히 놓입니다.', '가쪽 복사를 이루어 발목을 안정시키며 근육이 붙는 면을 제공합니다.'),
  Talus: member('목말뼈', 'leg', '발꿈치뼈 위의 발목관절 중앙에 있으며 정강뼈와 맞닿습니다.', '다리에서 내려오는 체중을 발로 전달하고 발목의 굽힘과 폄에 관여합니다.'),
  Calcaneus: member('발꿈치뼈', 'leg', '목말뼈 바로 아래와 뒤에서 발뒤꿈치를 이룹니다.', '뒤꿈치로 들어오는 하중을 지지하며 아킬레스힘줄이 부착되는 자리입니다.'),
  'Gluteus maximus muscle': member('큰볼기근 (대둔근)', 'lower', '볼기의 표면 근육으로 골반 뒤쪽에서 넙다리 쪽으로 이어집니다.', '엉덩관절을 펴며 계단을 오르거나 몸을 일으킬 때 기여합니다.'),
  'Gluteus medius muscle': member('중간볼기근 (중둔근)', 'lower', '골반 가쪽의 엉덩뼈에서 넙다리뼈 큰돌기로 이어집니다.', '다리를 옆으로 들고 걸을 때 지지하는 쪽 골반이 기울지 않도록 돕습니다.'),
  'Gluteus minimus muscle': member('작은볼기근 (소둔근)', 'lower', '중간볼기근 아래의 깊은 층에 놓입니다.', '다리를 옆으로 벌리고 엉덩관절의 안정성을 돕습니다.'),
  'Rectus femoris muscle': member('넙다리곧은근 (대퇴직근)', 'lower', '넙다리 앞쪽에서 골반 앞과 무릎뼈를 연결하는 네갈래근 부분입니다.', '무릎을 펴고 엉덩관절에서 넙다리를 앞으로 드는 데 참여합니다.'),
  'Tibialis anterior muscle': member('앞정강근', 'lower', '정강 앞쪽에서 시작해 발목 앞을 지나 발 안쪽에 닿습니다.', '발등을 위로 들어 올리고 발바닥을 안쪽으로 돌리는 데 기여합니다.'),
  'Tibialis posterior muscle': member('뒤정강근', 'lower', '종아리 뒤의 깊은 층에서 안쪽 복사 뒤를 돌아 발바닥 쪽으로 갑니다.', '발바닥을 안쪽으로 돌리고 발 안쪽 아치를 지지합니다.'),
  'Soleus muscle': member('가자미근', 'lower', '장딴지근 아래에서 아킬레스힘줄에 이어집니다.', '발목을 아래쪽으로 굽혀 발뒤꿈치를 들고 서 있는 동안 자세를 안정시키는 데 기여합니다.'),
  'Calcaneal tendon': member('발꿈치힘줄 (아킬레스힘줄)', 'lower', '종아리 뒤의 장딴지근과 가자미근에서 발꿈치뼈로 이어집니다.', '근육이 당기는 힘을 발꿈치로 전달해 걷거나 뛸 때 몸을 앞으로 밀어냅니다.'),
  'Sciatic nerve': member('궁둥신경 (좌골신경)', 'nerves', '골반에서 볼기 깊은 곳을 지나 넙다리 뒤로 내려갑니다.', '넙다리 뒤 근육의 운동에 관여하며 아래로 이어지는 가지가 종아리와 발의 감각·운동을 담당합니다.'),
  'Tibial nerve': member('정강신경', 'nerves', '무릎 뒤를 지나 종아리 뒤쪽과 발바닥으로 이어집니다.', '종아리 뒤와 발바닥의 여러 근육 운동을 조절하고 발바닥 감각을 전달합니다.'),
  'Femoral artery': member('넙다리동맥', 'vessels', '샅고랑 아래부터 넙다리 앞안쪽을 지나 무릎 뒤쪽으로 이어집니다.', '넙다리에 혈액을 공급하고 무릎 아래 방향의 순환으로 이어집니다.'),
  'Fibular artery': member('종아리동맥 (비골동맥)', 'vessels', '종아리뼈 가까이 종아리 뒤 깊은 층을 따라 내려갑니다.', '종아리 가쪽과 뒤쪽 및 발목 주변의 조직에 혈액을 공급합니다.'),
  'Corpus cavernosum of penis': member('음경해면체', 'reproductive', '음경 몸통의 등쪽에 나란히 놓인 두 발기 조직입니다.', '혈액이 들어차면서 발기 시 단단해집니다.'),
  'Corpus spongiosum of penis': member('요도해면체', 'reproductive', '음경 몸통 아래쪽에서 요도를 둘러싸고 귀두로 이어집니다.', '발기 시 혈액이 유입되며 요도 주변을 받칩니다.'),
  'Glans penis': member('귀두', 'reproductive', '요도해면체가 넓어지는 음경 끝부분에 위치합니다.', '감각신경이 분포하며 끝에 바깥요도구가 열립니다.'),
  'Scaphoid bone': member('손배뼈', 'arm', '손목의 엄지 쪽에서 노뼈와 가까운 줄에 있습니다.', '노뼈에서 손으로 들어오는 힘을 전달하고 손목 두 줄의 운동을 연결합니다.'),
  'Lunate bone': member('반달뼈', 'arm', '아래팔과 가까운 손목뼈 줄 가운데에 있습니다.', '노뼈와 만나 손목을 굽히고 펼 때 힘을 전달합니다.'),
  'Triquetrum bone': member('세모뼈', 'arm', '아래팔과 가까운 손목뼈 줄에서 새끼손가락 쪽에 놓입니다.', '손목 가쪽 움직임에 참여하고 앞쪽의 콩알뼈와 관절을 이룹니다.'),
  'Pisiform bone': member('콩알뼈', 'arm', '새끼손가락 쪽 손바닥에서 세모뼈 앞에 놓입니다.', '자쪽손목굽힘근 힘줄이 당기는 힘을 전달하는 작은 종자뼈입니다.'),
  'Trapezium bone': member('큰마름뼈', 'arm', '엄지손가락의 손허리뼈 바로 아래에 있는 손목뼈입니다.', '엄지가 다른 손가락을 마주 보는 운동을 허용하는 관절을 형성합니다.'),
  'Trapezoid bone': member('작은마름뼈', 'arm', '검지의 손허리뼈 아래쪽에서 큰마름뼈와 알머리뼈 사이에 놓입니다.', '검지 손허리뼈의 지지점이 되어 손바닥의 안정성에 기여합니다.'),
  'Capitate bone': member('알머리뼈', 'arm', '가운데손가락의 손허리뼈 바로 아래에 있는 손목 중앙의 큰 뼈입니다.', '손목의 두 줄을 잇고 가운데손가락 쪽에 실리는 힘을 전달합니다.'),
  'Hamate bone': member('갈고리뼈', 'arm', '넷째와 다섯째 손허리뼈 아래의 손목뼈입니다.', '손바닥 가쪽을 받치며 손바닥 면의 갈고리는 인대의 부착점이 됩니다.'),
  'Navicular bone': member('발배뼈', 'leg', '발 안쪽에서 목말뼈와 세 쐐기뼈 사이에 있습니다.', '발 안쪽 아치를 이루며 뒤정강근 힘줄의 주요 부착점입니다.'),
  'Medial cuneiform bone': member('안쪽쐐기뼈', 'leg', '발 안쪽에서 발배뼈와 첫째 발허리뼈 사이에 놓입니다.', '발 안쪽 기둥과 엄지발가락 쪽의 하중을 지지합니다.'),
  'Intermediate cuneiform bone': member('중간쐐기뼈', 'leg', '다른 두 쐐기뼈 사이에서 둘째 발허리뼈와 만납니다.', '발 중앙의 관절과 아치를 안정시키는 데 기여합니다.'),
  'Lateral cuneiform bone': member('가쪽쐐기뼈', 'leg', '중간쐐기뼈와 입방뼈 사이에서 셋째 발허리뼈와 만납니다.', '발 중간부에서 하중을 앞쪽으로 전달합니다.'),
  'Cuboid bone': member('입방뼈', 'leg', '발 바깥쪽에서 발꿈치뼈와 넷째·다섯째 발허리뼈 사이에 놓입니다.', '발 바깥쪽 기둥을 지지하며 바닥의 홈을 따라 긴종아리근 힘줄이 지납니다.'),
  'Lateral head of triceps brachii': member('위팔세갈래근 가쪽갈래', 'shoulder', '위팔뼈 뒤가쪽에서 시작해 공통 힘줄을 통해 팔꿈치머리로 이어집니다.', '다른 갈래와 함께 팔꿈치를 폅니다.'),
  'Long head of triceps brachii': member('위팔세갈래근 긴갈래', 'shoulder', '어깨뼈에서 시작하여 어깨와 팔꿈치 두 관절을 지납니다.', '팔꿈치를 펴고 위팔을 뒤로 보내는 움직임도 돕습니다.'),
  'Medial head of triceps brachii': member('위팔세갈래근 안쪽갈래', 'shoulder', '위팔 뒤쪽에서 다른 두 갈래보다 깊은 층에 놓입니다.', '위팔세갈래근의 공통 힘줄을 당겨 팔꿈치를 펴는 데 참여합니다.'),
  'Vastus lateralis muscle': member('가쪽넓은근', 'lower', '넙다리 앞가쪽에 놓인 네갈래근의 한 부분입니다.', '무릎관절을 펴며 무릎뼈에 전달되는 힘의 가쪽 부분을 담당합니다.'),
  'Vastus medialis muscle': member('안쪽넓은근', 'lower', '넙다리 앞안쪽에서 무릎뼈 안쪽까지 이어집니다.', '무릎을 펴고 무릎뼈가 움직이는 경로를 안정시키는 데 기여합니다.'),
  'Vastus intermedius muscle': member('중간넓은근', 'lower', '넙다리곧은근 아래에서 넙다리뼈 앞면을 덮습니다.', '다른 네갈래근 부분과 함께 무릎을 폅니다.'),
  'Long head of biceps femoris': member('넙다리두갈래근 긴갈래', 'lower', '궁둥뼈에서 시작해 넙다리 뒤가쪽을 지나 종아리뼈머리에 닿습니다.', '엉덩관절을 펴며 무릎을 굽히는 데 관여합니다.'),
  'Short head of biceps femoris': member('넙다리두갈래근 짧은갈래', 'lower', '넙다리뼈 뒤쪽에서 시작해 긴갈래와 만나 종아리뼈머리로 향합니다.', '무릎을 굽히고 굽힌 다리를 가쪽으로 돌리는 데 참여합니다.'),
  'Semitendinosus muscle': member('반힘줄근', 'lower', '궁둥뼈에서 시작해 넙다리 뒤안쪽을 지나 정강뼈 안쪽으로 이어집니다.', '엉덩관절을 펴고 무릎을 굽힙니다.'),
  'Medial head of gastrocnemius': member('장딴지근 안쪽갈래', 'lower', '넙다리뼈 안쪽관절융기 뒤에서 시작해 종아리 뒤 안쪽을 지나갑니다.', '아킬레스힘줄을 통해 발뒤꿈치를 들어 올리고 무릎 굽힘도 돕습니다.'),
  'Lateral head of gastrocnemius': member('장딴지근 가쪽갈래', 'lower', '넙다리뼈 가쪽관절융기 뒤에서 시작해 종아리 뒤 가쪽을 지나갑니다.', '안쪽갈래와 함께 발목을 아래로 굽히고 무릎 굽힘에 참여합니다.'),
  'Flexor digitorum brevis': member('짧은발가락굽힘근', 'lower', '발바닥 가운데의 얕은 층에서 발꿈치 쪽과 작은 발가락들을 잇습니다.', '둘째부터 다섯째 발가락의 가까운 마디관절을 굽히는 데 기여합니다.'),
  'Extensor digitorum brevis': member('짧은발가락폄근', 'lower', '발등 가쪽에서 발꿈치뼈 앞부분과 발가락 힘줄을 잇습니다.', '발등에서 둘째부터 넷째 발가락의 폄에 관여합니다.'),
};

const sharedMembers = {
  Liver: ['간', 'liver'],
  Gallbladder: ['담낭 (쓸개)', 'gallbladder'],
  Stomach: ['위', 'stomach'],
  Pancreas: ['췌장 (이자)', 'pancreas'],
  Spleen: ['비장 (지라)', 'spleen'],
  Diaphragm: ['가로막 (횡격막)', 'diaphragm'],
  'Abdominal aorta': ['복부 대동맥', 'abdominal_aorta'],
  'Inferior vena cava (abdominal part)': ['아래대정맥 (복부)', 'inferior_vena_cava'],
  'Rectus abdominis muscle': ['배곧은근 (복직근)', 'rectus_abdominis'],
  'External abdominal oblique muscle': ['배바깥빗근 (외복사근)', 'external_abdominal_oblique'],
  'Internal abdominal oblique muscle': ['배속빗근 (내복사근)', 'internal_abdominal_oblique'],
  'Transversus abdominis muscle': ['배가로근 (복횡근)', 'transversus_abdominis'],
  'Transversalis fascia': ['배가로근막', 'transversalis_fascia'],
  Trachea: ['기관', 'trachea'],
  Oesophagus: ['식도', 'esophagus'],
  'Left main bronchus': ['왼쪽 주기관지', 'bronchus_left'],
  'Right main bronchus': ['오른쪽 주기관지', 'bronchus_right'],
  'Spinal dura': ['척수 경막', 'spinal_dura'],
  Tongue: ['혀', 'tongue'],
  Humerus: ['위팔뼈', 'upper_arm'],
  Femur: ['넙다리뼈 (대퇴골)', 'thigh'],
};

const ordinals = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth'];
const spineSegments = {
  C: ['목뼈', '머리와 등뼈 사이', groupDetails.cervical_spine.role],
  T: ['등뼈', '가슴 뒤쪽', groupDetails.thoracic_spine.role],
  L: ['허리뼈', '허리 뒤쪽', groupDetails.lumbar_spine.role],
};

const teeth = {
  canine: ['송곳니', '앞니와 작은어금니 사이', '뾰족한 끝으로 음식물을 찢는 데 쓰입니다.'],
  'medial incisor': ['가운데앞니', '정중선 바로 옆', '납작한 앞날로 음식물을 잘라냅니다.'],
  'lateral incisor': ['가쪽앞니', '가운데앞니와 송곳니 사이', '앞쪽에서 음식물을 베어 물 때 사용합니다.'],
  'first premolar': ['첫째작은어금니', '송곳니 바로 뒤', '음식물을 눌러 부수고 갈기 시작합니다.'],
  'second premolar': ['둘째작은어금니', '첫째작은어금니와 첫째큰어금니 사이', '음식물을 으깨고 뒤의 큰어금니로 보내는 데 도움을 줍니다.'],
  'first molar tooth': ['첫째큰어금니', '둘째작은어금니 바로 뒤', '넓은 씹는 면으로 음식물을 잘게 부숩니다.'],
  'second molar tooth': ['둘째큰어금니', '첫째큰어금니 뒤', '음식물을 갈고 부수는 데 쓰입니다.'],
};

const handDigitNames = ['엄지손가락', '검지', '가운데손가락', '약지', '새끼손가락'];
const toeNames = ['엄지발가락', '둘째 발가락', '셋째 발가락', '넷째 발가락', '새끼발가락'];
const phalanxLocations = {
  Proximal: ['첫마디뼈', '손허리뼈나 발허리뼈에 가장 가까운 마디입니다.'],
  Middle: ['중간마디뼈', '첫마디뼈와 끝마디뼈 사이의 뼈입니다.'],
  Distal: ['끝마디뼈', '손톱이나 발톱 바로 아래의 가장 끝에 있는 마디입니다.'],
};

function numberedMember(name) {
  const vertebra = /^Vertebra ([CTL])(\d+)$/.exec(name);
  if (vertebra) {
    const [, segment, index] = vertebra;
    const [label, location, role] = spineSegments[segment];
    return member(`제${index}${label} (${segment}${index})`, 'spine',
      `${location}에서 위로부터 ${index}번째에 위치합니다.`, role);
  }
  const rib = /^([A-Za-z]+) rib$/.exec(name);
  if (rib && ordinals.includes(rib[1])) {
    const index = ordinals.indexOf(rib[1]) + 1;
    return member(`제${index}갈비뼈`, 'ribs', `등뼈에서 시작해 몸통 가쪽을 감싸는 위에서 ${index}번째 갈비뼈입니다.`, groupDetails.rib_cage.role);
  }
  const cartilage = /^Costal cartilage of (\w+) rib$/.exec(name);
  if (cartilage) {
    const index = ordinals.indexOf(cartilage[1][0].toUpperCase() + cartilage[1].slice(1)) + 1;
    return member(`제${index}갈비연골`, 'ribs', `제${index}갈비뼈 앞쪽 끝에서 가슴 중앙을 향하는 연골입니다.`,
      '갈비뼈 앞쪽에 탄성을 더해 호흡할 때 가슴우리가 움직이도록 돕습니다.');
  }
  const digit = /^(Proximal|Middle|Distal) phalanx of (\w+) finger of (hand|foot)$/.exec(name);
  if (digit) {
    const [, part, ordinal, limb] = digit;
    const isHand = limb === 'hand';
    const index = ordinals.indexOf(ordinal[0].toUpperCase() + ordinal.slice(1));
    const [label, location] = phalanxLocations[part];
    return member(`${(isHand ? handDigitNames : toeNames)[index]} ${label}`, isHand ? 'arm' : 'leg',
      location, (isHand ? handDigits : footDigits).role);
  }
  const metapodial = /^(\w+) (metacarpal|metatarsal) bone$/.exec(name);
  if (metapodial) {
    const [, ordinal, bone] = metapodial;
    const index = ordinals.indexOf(ordinal);
    const isHand = bone === 'metacarpal';
    return member(`제${index + 1}${isHand ? '손허리뼈' : '발허리뼈'}`, isHand ? 'arm' : 'leg',
      `${(isHand ? handDigitNames : toeNames)[index]}의 첫마디뼈와 ${isHand ? '손목뼈' : '발목뼈'} 사이에 놓입니다.`,
      (isHand ? groupDetails.palm : groupDetails.foot).role);
  }
  const tooth = /^(Upper|Lower) (.+)$/.exec(name);
  const entry = tooth && teeth[tooth[2]];
  if (entry) {
    const [label, location, role] = entry;
    const jaw = tooth[1] === 'Upper' ? '위턱' : '아래턱';
    return member(jaw + ' ' + label, 'mouth', `${jaw} 치열의 ${location}에 있습니다.`, role);
  }
  return undefined;
}

const heartPositions = { Anterior: '앞', Inferior: '아래', Septal: '사이막', Posterior: '뒤', Left: '왼쪽', Right: '오른쪽' };

const bronchialSegments = {
  Anterior: '앞', Posterior: '뒤', Apical: '꼭대기', Apicoposterior: '꼭대기뒤', Superior: '위', Lateral: '가쪽', Medial: '안쪽',
  'Anterior basal': '앞바닥', 'Lateral basal': '가쪽바닥', 'Medial basal': '안쪽바닥', 'Posterior basal': '뒤바닥',
  'Superior lingular': '위혀', 'Inferior lingular': '아래혀',
};

function bronchialMember(name) {
  if (name === 'Intermediate bronchus') return member('중간기관지', 'breathing', '오른 위폐엽기관지가 갈라진 뒤 이어지는 오른쪽 기도입니다.', '오른 중간폐엽과 아래폐엽으로 공기를 보냅니다.');
  const lobar = /^(?:(Left|Right) )?(superior|inferior|middle) lobar bronchus$/i.exec(name);
  if (lobar) {
    const lobe = { superior: '위폐엽', inferior: '아래폐엽', middle: '중간폐엽' }[lobar[2].toLowerCase()];
    const side = { Left: '왼쪽 ', Right: '오른쪽 ' }[lobar[1]] ?? '';
    return member(`${side}${lobe} 기관지`, 'breathing', `${side}${lobe}의 입구에서 시작해 폐 안으로 뻗습니다.`, '각 구역기관지로 공기를 나눠 보냅니다.');
  }
  if (name === '(Anteromedial basal segmental bronchus of left lung)') return member('왼쪽 앞안쪽바닥구역기관지', 'breathing', '왼 아래폐엽에서 앞·안쪽 바닥구역 쪽으로 뻗는 형상입니다.', '해당 폐구역에 공기를 전하는 기도입니다.');
  const segment = /^([A-Za-z ]+) segmental bronchus of (left|right) lung \((B[IVX]+(?:\+B[IVX]+)?)\)$/.exec(name);
  if (segment && bronchialSegments[segment[1]]) {
    const lung = segment[2] === 'left' ? '왼쪽' : '오른쪽';
    return member(`${lung} ${bronchialSegments[segment[1]]}구역기관지 (${segment[3]})`, 'breathing', `${lung} 폐에서 한 기관지폐구역으로 갈라지는 가지입니다.`, '해당 폐구역에 공기가 드나드는 통로입니다.');
  }
  return undefined;
}

function heartMember(name) {
  const papillary = /^(\w+) papillary muscle of (left|right) ventricle$/.exec(name);
  if (papillary) {
    const chamber = papillary[2] === 'left' ? '왼심실' : '오른심실';
    return member(`${chamber} ${heartPositions[papillary[1]]} 유두근`, 'heart', `${chamber} 안쪽 벽에서 판막 힘줄끈으로 이어집니다.`,
      '심실이 수축할 때 힘줄끈을 당겨 심방과 심실 사이 판막이 심방 쪽으로 뒤집히는 것을 막습니다.');
  }
  const pulmonary = /^(\w+) semilunar leaflet of pulmonary valve$/.exec(name);
  if (pulmonary) {
    return member(`폐동맥판막 ${heartPositions[pulmonary[1]]} 반달판막엽`, 'heart', '오른심실과 폐동맥줄기 사이 판막의 일부입니다.',
      '심실이 이완할 때 다른 판막엽과 맞물려 폐동맥의 혈액이 심실로 되돌아오는 흐름을 막습니다.');
  }
  const atrioventricular = /^(\w+) leaflet of (left|right) atrioventricular valve$/.exec(name);
  if (atrioventricular) {
    const left = atrioventricular[2] === 'left';
    return member(`${left ? '승모판' : '삼첨판'} ${heartPositions[atrioventricular[1]]}판막엽`, 'heart',
      `${left ? '왼심방과 왼심실' : '오른심방과 오른심실'} 사이 판막을 이루는 부분입니다.`,
      '심실이 수축할 때 닫혀 심실에서 심방으로 되돌아가는 혈류를 제한합니다.');
  }
  const aortic = { 'Left coronary leaflet': '왼관상판막엽', 'Right coronary leaflet': '오른관상판막엽', 'Non-coronary leaflet': '비관상판막엽' };
  if (aortic[name]) {
    return member(`대동맥판막 ${aortic[name]}`, 'heart', '왼심실과 오름대동맥 사이의 반달판막을 이루는 부분입니다.',
      '심실이 이완하면 닫혀 대동맥에서 왼심실 쪽으로 되돌아오는 혈류를 막습니다.');
  }
  return undefined;
}

const sourceNameCorrections = new Map([
  ['Ascending part of trapezius muscle', 'Descending part of trapezius muscle'],
  ['Descending part of trapezius muscle', 'Ascending part of trapezius muscle'],
]);

export function getMemberDetails(sourceName) {
  const side = sourceName.endsWith('.l') ? '왼쪽 ' : sourceName.endsWith('.r') ? '오른쪽 ' : '';
  const originalName = sourceName.replace(/\.[lr]$/, '');
  const name = sourceNameCorrections.get(originalName) ?? originalName;
  const shared = sharedMembers[name];
  let details = memberDetails[name];
  if (shared) details = { label: shared[0], ...groupDetails[shared[1]] };
  if (name === 'Kidney') details = { label: '콩팥 (신장)', ...groupDetails[side === '왼쪽 ' ? 'left_kidney' : 'right_kidney'] };
  details ??= numberedMember(name) ?? heartMember(name) ?? bronchialMember(name);
  return {
    ...details,
    label: side + (details?.label ?? (/^\?+$/.test(name) ? '이름 미상 (원본)' : name)),
    en: (side === '왼쪽 ' ? 'Left ' : side ? 'Right ' : '') + name,
  };
}
