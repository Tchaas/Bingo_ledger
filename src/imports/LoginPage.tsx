import svgPaths from "./svg-es0al6qnin";

function Div() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[68px] left-0 not-italic text-center top-0 w-[448px]" data-name="div">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold h-[36px] leading-[36px] left-[224px] text-[30px] text-gray-900 top-0 translate-x-[-50%] w-[448px]">Welcome back</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[24px] leading-[24px] left-[224px] text-[16px] text-gray-600 top-[44px] translate-x-[-50%] w-[448px]">Sign in to your account to continue</p>
    </div>
  );
}

function Label() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[20px] left-0 top-0 w-[448px]" data-name="label">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold h-[20px] leading-[normal] left-0 not-italic text-[14px] text-gray-700 top-px w-[102px]">Email Address</p>
    </div>
  );
}

function Input() {
  return (
    <div className="absolute bg-white border border-gray-300 border-solid h-[50px] left-0 rounded-[8px] top-0 w-[448px]" data-name="input">
      <div className="absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[50px] justify-center leading-[0] left-[43px] not-italic text-[#adaebc] text-[16px] top-[24px] translate-y-[-50%] w-[448px]">
        <p className="leading-[24px]">Enter your email</p>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Frame">
          <path d="M16 16H0V0H16V16Z" stroke="var(--stroke-0, #E5E7EB)" />
          <path d={svgPaths.pa71cb00} fill="var(--fill-0, #9CA3AF)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Svg() {
  return (
    <div className="absolute content-stretch flex items-center justify-center left-0 size-[16px] top-[4px]" data-name="svg">
      <Frame />
    </div>
  );
}

function I() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[24px] left-[12px] top-[13px] w-[16px]" data-name="i">
      <Svg />
    </div>
  );
}

function Div1() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[50px] left-0 top-0 w-[28px]" data-name="div">
      <I />
    </div>
  );
}

function Div2() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[50px] left-0 top-[28px] w-[448px]" data-name="div">
      <Input />
      <Div1 />
    </div>
  );
}

function Div3() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[78px] left-0 top-0 w-[448px]" data-name="div">
      <Label />
      <Div2 />
    </div>
  );
}

function Label1() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[20px] left-0 top-0 w-[448px]" data-name="label">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold h-[20px] leading-[normal] left-0 not-italic text-[14px] text-gray-700 top-px w-[72px]">Password</p>
    </div>
  );
}

function Input1() {
  return (
    <div className="absolute bg-white border border-gray-300 border-solid h-[50px] left-0 rounded-[8px] top-0 w-[448px]" data-name="input">
      <div className="absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[50px] justify-center leading-[0] left-[43px] not-italic text-[#adaebc] text-[16px] top-[24px] translate-y-[-50%] w-[448px]">
        <p className="leading-[24px]">Enter your password</p>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="h-[16px] relative shrink-0 w-[14px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 16">
        <g id="Frame">
          <g clipPath="url(#clip0_1_90)">
            <path d={svgPaths.pcd0dd00} fill="var(--fill-0, #9CA3AF)" id="Vector" />
          </g>
        </g>
        <defs>
          <clipPath id="clip0_1_90">
            <path d="M0 0H14V16H0V0Z" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Svg1() {
  return (
    <div className="absolute content-stretch flex h-[16px] items-center justify-center left-0 top-[4px] w-[14px]" data-name="svg">
      <Frame1 />
    </div>
  );
}

function I1() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[24px] left-[12px] top-[13px] w-[14px]" data-name="i">
      <Svg1 />
    </div>
  );
}

function Div4() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[50px] left-0 top-0 w-[26px]" data-name="div">
      <I1 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="h-[16px] relative shrink-0 w-[18px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 16">
        <g id="Frame">
          <g clipPath="url(#clip0_1_87)">
            <path d={svgPaths.p27070ff0} fill="var(--fill-0, #9CA3AF)" id="Vector" />
          </g>
        </g>
        <defs>
          <clipPath id="clip0_1_87">
            <path d="M0 0H18V16H0V0Z" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Svg2() {
  return (
    <div className="absolute content-stretch flex h-[16px] items-center justify-center left-0 top-[4px] w-[18px]" data-name="svg">
      <Frame2 />
    </div>
  );
}

function I2() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[24px] left-0 top-[13px] w-[18px]" data-name="i">
      <Svg2 />
    </div>
  );
}

function Button() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[50px] left-[418px] top-0 w-[30px]" data-name="button">
      <I2 />
    </div>
  );
}

function Div5() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[50px] left-0 top-[28px] w-[448px]" data-name="div">
      <Input1 />
      <Div4 />
      <Button />
    </div>
  );
}

function Div6() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[78px] left-0 top-[102px] w-[448px]" data-name="div">
      <Label1 />
      <Div5 />
    </div>
  );
}

function Input2() {
  return <div className="absolute bg-white border-[0.5px] border-black border-solid left-0 rounded-[1px] size-[16px] top-[2px]" data-name="input" />;
}

function Label2() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[20px] left-0 top-0 w-[120.031px]" data-name="label">
      <Input2 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[20px] leading-[20px] left-[24px] not-italic text-[14px] text-gray-600 top-0 w-[97px]">Remember me</p>
    </div>
  );
}

function Div7() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[20px] left-[328.19px] top-0 w-[119.813px]" data-name="div">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium h-[20px] leading-[normal] left-0 not-italic text-[14px] text-blue-600 top-px w-[120px]">Forgot password?</p>
    </div>
  );
}

function Div8() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[20px] left-0 top-[204px] w-[448px]" data-name="div">
      <Label2 />
      <Div7 />
    </div>
  );
}

function Span() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[24px] left-[186.67px] top-[12px] w-[52.641px]" data-name="span">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold h-[24px] leading-[normal] left-[26.5px] not-italic text-[16px] text-center text-white top-[2px] translate-x-[-50%] w-[53px]">Sign In</p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="h-[16px] relative shrink-0 w-[14px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 16">
        <g id="Frame">
          <path d="M14 16H0V0H14V16Z" stroke="var(--stroke-0, #E5E7EB)" />
          <path d={svgPaths.p18af0c00} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Svg3() {
  return (
    <div className="absolute content-stretch flex h-[16px] items-center justify-center left-0 top-[4px] w-[14px]" data-name="svg">
      <Frame3 />
    </div>
  );
}

function I3() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[24px] left-[247.31px] top-[12px] w-[14px]" data-name="i">
      <Svg3 />
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute bg-blue-600 border-0 border-gray-200 border-solid h-[48px] left-0 rounded-[8px] top-[248px] w-[448px]" data-name="button">
      <Span />
      <I3 />
    </div>
  );
}

function Form() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[296px] left-0 top-[100px] w-[448px]" data-name="form">
      <Div3 />
      <Div6 />
      <Div8 />
      <Button1 />
    </div>
  );
}

function Span1() {
  return (
    <div className="absolute bg-gray-50 border-0 border-gray-200 border-solid h-[20px] left-[209.16px] top-0 w-[29.672px]" data-name="span">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[20px] leading-[normal] left-[17.5px] not-italic text-[14px] text-center text-gray-500 top-px translate-x-[-50%] w-[19px]">or</p>
    </div>
  );
}

function Div9() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[20px] left-0 top-0 w-[448px]" data-name="div">
      <Span1 />
    </div>
  );
}

function Div10() {
  return <div className="absolute bg-[rgba(0,0,0,0)] border-[1px_0px_0px] border-gray-300 border-solid h-px left-0 top-[9.5px] w-[448px]" data-name="div" />;
}

function Div11() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[20px] left-0 top-0 w-[448px]" data-name="div">
      <Div10 />
    </div>
  );
}

function Div12() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[20px] left-0 top-0 w-[448px]" data-name="div">
      <Div9 />
      <Div11 />
    </div>
  );
}

function Div13() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[20px] left-0 top-[420px] w-[448px]" data-name="div">
      <Div12 />
    </div>
  );
}

function Div14() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[24px] left-0 top-[24px] w-[448px]" data-name="div">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold h-[24px] leading-[normal] left-[224px] not-italic text-[16px] text-blue-600 text-center top-[2px] translate-x-[-50%] w-[448px]">Create one now</p>
    </div>
  );
}

function Div15() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[48px] left-0 top-[24px] w-[448px]" data-name="div">
      <Div14 />
    </div>
  );
}

function Div16() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[120px] left-0 top-[464px] w-[448px]" data-name="div">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[24px] leading-[24px] left-[224px] not-italic text-[16px] text-center text-gray-600 top-[12px] translate-x-[-50%] w-[448px]">{`Don't have an account?`}</p>
      <Div15 />
    </div>
  );
}

function Div17() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[16px] left-[123.91px] top-0 w-[45.328px]" data-name="div">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[16px] leading-[normal] left-[23px] not-italic text-[12px] text-center text-gray-500 top-0 translate-x-[-50%] w-[46px]">Support</p>
    </div>
  );
}

function Div18() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[16px] left-[207.98px] top-0 w-[42px]" data-name="div">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[16px] leading-[normal] left-[21px] not-italic text-[12px] text-center text-gray-500 top-0 translate-x-[-50%] w-[42px]">Privacy</p>
    </div>
  );
}

function Div19() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[16px] left-[288.73px] top-0 w-[35.359px]" data-name="div">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[16px] leading-[normal] left-[18px] not-italic text-[12px] text-center text-gray-500 top-0 translate-x-[-50%] w-[36px]">Terms</p>
    </div>
  );
}

function Div20() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[16px] left-0 top-[24px] w-[448px]" data-name="div">
      <Div17 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[16px] leading-[16px] left-[188.73px] not-italic text-[12px] text-center text-gray-300 top-0 translate-x-[-50%] w-[7px]">•</p>
      <Div18 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[16px] leading-[16px] left-[269.48px] not-italic text-[12px] text-center text-gray-300 top-0 translate-x-[-50%] w-[7px]">•</p>
      <Div19 />
    </div>
  );
}

function Div21() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[40px] left-0 top-[696px] w-[448px]" data-name="div">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[16px] leading-[16px] left-[224px] not-italic text-[12px] text-center text-gray-500 top-0 translate-x-[-50%] w-[448px]">Need help?</p>
      <Div20 />
    </div>
  );
}

function Div22() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[736px] left-[168px] top-[48px] w-[448px]" data-name="div">
      <Div />
      <Form />
      <Div13 />
      <Div16 />
      <Div21 />
    </div>
  );
}

function Div23() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[832px] left-[656px] top-0 w-[784px]" data-name="div">
      <Div22 />
    </div>
  );
}

function Div24() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] border-0 border-gray-200 border-solid h-[832px] left-0 top-0 w-[1440px]" data-name="div">
      <Div23 />
    </div>
  );
}

function Body() {
  return (
    <div className="bg-gray-50 h-[832px] relative shrink-0 w-[1440px]" data-name="body">
      <div aria-hidden="true" className="absolute border-0 border-gray-200 border-solid inset-0 pointer-events-none" />
      <Div24 />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="bg-white relative rounded-[8px] size-full" data-name="Login Page">
      <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <Body />
      </div>
      <div aria-hidden="true" className="absolute border-2 border-[#ced4da] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}