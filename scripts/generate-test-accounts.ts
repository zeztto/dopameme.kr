import bcrypt from 'bcryptjs'

// 무작위 닉네임 생성 함수
function generateRandomNickname(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const specialChars = '!@#$%^&*-_=+'

  const allChars = uppercase + lowercase + specialChars

  let nickname = ''
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * allChars.length)
    nickname += allChars[randomIndex]
  }

  return nickname
}

async function generateSQL() {
  // 모든 테스트 계정에 사용할 비밀번호 'test1234'를 해시
  const password = 'test1234'
  const hashedPassword = await bcrypt.hash(password, 10)

  console.log('-- 테스트 계정 생성 SQL')
  console.log('-- 비밀번호: test1234')
  console.log('-- Role: test (리더보드에 표시되지 않음)')
  console.log('-- Name: 영문 대소문자 + 특수문자 12글자 무작위 생성 (닉네임으로 사용)\n')

  // 중복 방지를 위한 Set
  const usedNicknames = new Set<string>()

  // 100개의 테스트 계정 INSERT 문 생성
  for (let i = 1; i <= 100; i++) {
    const id = `test-user-${i}`
    const email = `test${i}@test.com`

    // 중복되지 않는 닉네임 생성 (name 필드에 저장)
    let nickname = generateRandomNickname()
    while (usedNicknames.has(nickname)) {
      nickname = generateRandomNickname()
    }
    usedNicknames.add(nickname)

    console.log(`INSERT INTO users (id, name, email, password, role, dpmm_balance, created_at)`)
    console.log(`VALUES ('${id}', '${nickname}', '${email}', '${hashedPassword}', 'test', 10000, NOW());`)
    console.log('')
  }
}

generateSQL()
