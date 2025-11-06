/**
 * 무작위 닉네임 생성 함수
 * 영문 대소문자 + 특수문자로 12글자 생성
 */
export function generateRandomNickname(): string {
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
