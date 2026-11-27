/** @type {import('next').NextConfig} */
const nextConfig = {
  // private/ 폴더의 정적 HTML을 서버 함수가 읽을 수 있게 배포 번들에 포함한다.
  outputFileTracingIncludes: { "/files/ebs-2027": ["./private/**"] },
};
export default nextConfig;
