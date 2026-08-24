import React, { useEffect, useRef } from 'react';

interface AnimatedAvatarProps {
  isPasswordFocused: boolean;
  emailValue: string;
  isEmailFocused: boolean;
}

export const AnimatedAvatar: React.FC<AnimatedAvatarProps> = ({
  isPasswordFocused,
  emailValue,
  isEmailFocused
}) => {
  const armLRef = useRef<SVGGElement>(null);
  const armRRef = useRef<SVGGElement>(null);
  const eyeLRef = useRef<SVGGElement>(null);
  const eyeRRef = useRef<SVGGElement>(null);
  const noseRef = useRef<SVGPathElement>(null);
  const mouthRef = useRef<SVGGElement>(null);
  const faceRef = useRef<SVGPathElement>(null);

  // Arm position effect when password field is focused
  useEffect(() => {
    if (armLRef.current && armRRef.current) {
      if (isPasswordFocused) {
        // Hands cover eyes
        armLRef.current.style.transform = 'translate(-93px, 2px) rotate(0deg)';
        armLRef.current.style.transition = 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)';
        armRRef.current.style.transform = 'translate(-93px, 2px) rotate(0deg)';
        armRRef.current.style.transition = 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1) 0.05s';
      } else {
        // Hands drop down
        armLRef.current.style.transform = 'translate(-93px, 220px) rotate(105deg)';
        armLRef.current.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
        armRRef.current.style.transform = 'translate(-93px, 220px) rotate(-105deg)';
        armRRef.current.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1) 0.05s';
      }
    }
  }, [isPasswordFocused]);

  // Eye and face tracking when typing email
  useEffect(() => {
    if (isPasswordFocused) return;

    if (!isEmailFocused || emailValue.length === 0) {
      // Reset position
      if (eyeLRef.current) eyeLRef.current.style.transform = 'translate(0, 0)';
      if (eyeRRef.current) eyeRRef.current.style.transform = 'translate(0, 0)';
      if (noseRef.current) noseRef.current.style.transform = 'translate(0, 0)';
      if (mouthRef.current) mouthRef.current.style.transform = 'translate(0, 0)';
      if (faceRef.current) faceRef.current.style.transform = 'translate(0, 0)';
      return;
    }

    // Calculate dynamic gaze based on text length (clamp between -10px and +10px)
    const normalizedLength = Math.min(emailValue.length, 30);
    const offsetX = (normalizedLength / 30) * 16 - 8;
    const offsetY = 4;

    if (eyeLRef.current) {
      eyeLRef.current.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      eyeLRef.current.style.transition = 'transform 0.15s ease-out';
    }
    if (eyeRRef.current) {
      eyeRRef.current.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      eyeRRef.current.style.transition = 'transform 0.15s ease-out';
    }
    if (noseRef.current) {
      noseRef.current.style.transform = `translate(${offsetX * 0.7}px, ${offsetY * 0.7}px)`;
      noseRef.current.style.transition = 'transform 0.15s ease-out';
    }
    if (mouthRef.current) {
      mouthRef.current.style.transform = `translate(${offsetX * 0.5}px, ${offsetY * 0.5}px)`;
      mouthRef.current.style.transition = 'transform 0.15s ease-out';
    }
    if (faceRef.current) {
      faceRef.current.style.transform = `translate(${offsetX * 0.3}px, 0)`;
      faceRef.current.style.transition = 'transform 0.15s ease-out';
    }
  }, [emailValue, isEmailFocused, isPasswordFocused]);

  return (
    <div className="svgAvatarContainer d-flex justify-content-center my-3">
      <div style={{ width: '135px', height: '135px', position: 'relative' }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 200 200"
          style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: '50%', boxShadow: '0 8px 24px rgba(244,81,30,0.18)' }}
        >
          <defs>
            <circle id="avatarArmMaskPath" cx="100" cy="100" r="100" />
            <clipPath id="avatarArmMask">
              <use xlinkHref="#avatarArmMaskPath" overflow="visible" />
            </clipPath>
          </defs>

          {/* Background circle */}
          <circle cx="100" cy="100" r="100" fill="#ea580c" />

          {/* Body */}
          <g className="body">
            <path
              fill="#FFFFFF"
              d="M193.3,135.9c-5.8-8.4-15.5-13.9-26.5-13.9H151V72c0-27.6-22.4-50-50-50S51,44.4,51,72v50H32.1 c-10.6,0-20,5.1-25.8,13l0,78h187L193.3,135.9z"
            />
            <path
              fill="none"
              stroke="#1c1917"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M193.3,135.9 c-5.8-8.4-15.5-13.9-26.5-13.9H151V72c0-27.6-22.4-50-50-50S51,44.4,51,72v50H32.1c-10.6,0-20,5.1-25.8,13"
            />
            <path
              fill="#fffaf5"
              d="M100,156.4c-22.9,0-43,11.1-54.1,27.7c15.6,10,34.2,15.9,54.1,15.9s38.5-5.8,54.1-15.9 C143,167.5,122.9,156.4,100,156.4z"
            />
          </g>

          {/* Left Ear */}
          <g className="earL">
            <g className="outerEar" fill="#ffedd5" stroke="#1c1917" strokeWidth="2.5">
              <circle cx="47" cy="83" r="11.5" />
              <path d="M46.3 78.9c-2.3 0-4.1 1.9-4.1 4.1 0 2.3 1.9 4.1 4.1 4.1" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>

          {/* Right Ear */}
          <g className="earR">
            <g className="outerEar" fill="#ffedd5" stroke="#1c1917" strokeWidth="2.5">
              <circle cx="155" cy="83" r="11.5" />
              <path d="M155.7 78.9c2.3 0 4.1 1.9 4.1 4.1 0 2.3-1.9 4.1-4.1 4.1" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>

          {/* Face */}
          <path
            ref={faceRef}
            className="face"
            fill="#ffedd5"
            d="M134.5,46v35.5c0,21.815-15.446,39.5-34.5,39.5s-34.5-17.685-34.5-39.5V46"
          />

          {/* Hair (Chef Hat / Engineer Hair) */}
          <path
            className="hair"
            fill="#FFFFFF"
            stroke="#1c1917"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M81.457,27.929 c1.755-4.084,5.51-8.262,11.253-11.77c0.979,2.565,1.883,5.14,2.712,7.723c3.162-4.265,8.626-8.27,16.272-11.235 c-0.737,3.293-1.588,6.573-2.554,9.837c4.857-2.116,11.049-3.64,18.428-4.156c-2.403,3.23-5.021,6.391-7.852,9.474"
          />

          {/* Eyebrows */}
          <g className="eyebrow">
            <path
              fill="#FFFFFF"
              stroke="#1c1917"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M63.56,55.102 c6.243,5.624,13.38,10.614,21.296,14.738c2.071-2.785,4.01-5.626,5.816-8.515c4.537,3.785,9.583,7.263,15.097,10.329 c1.197-3.043,2.287-6.104,3.267-9.179c4.087,2.004,8.427,3.761,12.996,5.226c0.545-3.348,0.986-6.696,1.322-10.037 c4.913-0.481,9.857-1.34,14.787-2.599"
            />
          </g>

          {/* Left Eye */}
          <g ref={eyeLRef} className="eyeL">
            <circle cx="85.5" cy="78.5" r="3.8" fill="#1c1917" />
            <circle cx="84" cy="76.5" r="1.2" fill="#fff" />
          </g>

          {/* Right Eye */}
          <g ref={eyeRRef} className="eyeR">
            <circle cx="114.5" cy="78.5" r="3.8" fill="#1c1917" />
            <circle cx="113" cy="76.5" r="1.2" fill="#fff" />
          </g>

          {/* Nose */}
          <path
            ref={noseRef}
            className="nose"
            d="M97.7 79.9h4.7c1.9 0 3 2.2 1.9 3.7l-2.3 3.3c-.9 1.3-2.9 1.3-3.8 0l-2.3-3.3c-1.3-1.6-.2-3.7 1.8-3.7z"
            fill="#ea580c"
          />

          {/* Mouth (Smiling) */}
          <g ref={mouthRef} className="mouth">
            <path
              fill="#c2410c"
              stroke="#1c1917"
              strokeWidth="2"
              d="M93,98 c0,4 3.5,7 7,7 s7,-3 7,-7 Z"
            />
            <path
              fill="#fff"
              d="M96,98 h8 v2 c0,1.1 -0.9,2 -2,2 h-4 c-1.1,0 -2,-0.9 -2,-2 Z"
            />
          </g>

          {/* Animated Arms covering eyes on password */}
          <g className="arms" clipPath="url(#avatarArmMask)">
            {/* Left Arm */}
            <g
              ref={armLRef}
              className="armL"
              style={{
                transform: 'translate(-93px, 220px) rotate(105deg)',
                transformOrigin: 'top left'
              }}
            >
              <path
                fill="#ffedd5"
                stroke="#1c1917"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit="10"
                strokeWidth="2.5"
                d="M121.3 97.4L111 58.7l38.8-10.4 20 36.1z"
              />
              <path
                fill="#fff"
                stroke="#1c1917"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M123.5 96.8c-41.4 14.9-84.1 30.7-108.2 35.5L1.2 80c33.5-9.9 71.9-16.5 111.9-21.8"
              />
            </g>

            {/* Right Arm */}
            <g
              ref={armRRef}
              className="armR"
              style={{
                transform: 'translate(-93px, 220px) rotate(-105deg)',
                transformOrigin: 'top right'
              }}
            >
              <path
                fill="#ffedd5"
                stroke="#1c1917"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit="10"
                strokeWidth="2.5"
                d="M265.4 97.3l10.4-38.6-38.9-10.5-20 36.1z"
              />
              <path
                fill="#fff"
                stroke="#1c1917"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M263.3 96.7c41.4 14.9 84.1 30.7 108.2 35.5l14-52.3C352 70 313.6 63.5 273.6 58.1"
              />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};
