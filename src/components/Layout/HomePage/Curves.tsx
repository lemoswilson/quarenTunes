import React from 'react';

const Curves: React.FC<{rotate?: number, className?: string, lineClass?: string, sel?: number }> = ({rotate, className, lineClass, sel }) => {
    // const center = '433 410'
    const cx = 433
    const cy = 410
    const rotateBy = `rotate(${rotate ? rotate : 0} ${cx} ${cy})`
    const coordinates = [
        "M423.86,414.49c4.55,3.55,5.55,9.67,8,14.79s8.75,9.91,13.63,7c2.52-1.53,3.5-4.52,4.79-7.11,5.86-11.69,22.55-16.88,34.7-10.77s17.43,22.33,11,33.73c-7.47-2.54-16.46.34-20.72,6.63a17.14,17.14,0,0,0,2,21c9.44-6.34,24.46-2.93,30.19,6.87s.85,23.7-9.81,28c-3.08,1.22-6.53,1.76-9.18,3.68-6.81,4.93-4.5,15.43,0,22.54s10.78,14.24,10,22.44c-.27,2.93-1.67,5.93-4.36,7.28-5.17,2.59-11.18-2.07-14.53-6.76s-6.92-10.41-12.78-11c-10.4-1-13.17,14-22,19.22-7.84,4.61-18.76-.19-23.92-7.65s-6.24-16.7-7.83-25.48-4.24-18.09-11.36-23.88c-3.77-3.06-8.46-4.84-12.54-7.49-12.21-7.95-17.63-24.34-12.34-37.35-5.33-1.52-10.8-3.12-15.16-6.45s-7.39-8.89-6-14c1.66-5.94,8.75-9.14,15.18-8.73,5.9.37,12.3,3.32,17.43,6C397.56,440,405.07,399.84,423.86,414.49Z",
        "M436.3,420.1c3.74-4.79,10.19-5.84,15.57-8.38s10.44-9.22,7.33-14.36c-1.61-2.65-4.76-3.67-7.48-5-12.31-6.17-17.77-23.73-11.34-36.52s23.51-18.36,35.51-11.57c-2.68,7.86.35,17.33,7,21.81A18,18,0,0,0,505,363.93c-6.68-9.93-3.08-25.75,7.23-31.78s24.95-.89,29.43,10.33c1.29,3.24,1.86,6.87,3.88,9.67,5.18,7.17,16.24,4.73,23.72,0s15-11.34,23.63-10.54c3.07.29,6.24,1.76,7.66,4.6,2.72,5.44-2.19,11.77-7.12,15.29s-11,7.29-11.53,13.45c-1,10.95,14.77,13.87,20.23,23.16,4.85,8.25-.21,19.75-8.06,25.18s-17.57,6.57-26.81,8.24-19,4.46-25.14,12c-3.22,4-5.09,8.9-7.89,13.2-8.37,12.85-25.62,18.56-39.32,13-1.6,5.61-3.27,11.37-6.79,16s-9.35,7.77-14.72,6.27c-6.25-1.74-9.62-9.21-9.19-16,.39-6.21,3.49-12.94,6.31-18.35C463.11,447.79,420.89,439.88,436.3,420.1Z",
        "M442.21,407c-5-3.93-6.15-10.72-8.82-16.38s-9.71-11-15.11-7.72c-2.8,1.7-3.87,5-5.31,7.88-6.49,13-25,18.7-38.45,11.93S355.21,378,362.34,365.33c8.28,2.82,18.25-.36,23-7.33s3.76-17.08-2.22-23.29c-10.46,7-27.11,3.25-33.46-7.6s-.94-26.27,10.88-31c3.41-1.36,7.23-1.95,10.17-4.08,7.55-5.46,5-17.09,0-25s-11.95-15.78-11.1-24.87c.31-3.24,1.85-6.57,4.84-8.07,5.73-2.86,12.39,2.3,16.1,7.5s7.67,11.53,14.15,12.14c11.53,1.07,14.6-15.55,24.38-21.3,8.69-5.1,20.79.22,26.51,8.48s6.91,18.5,8.68,28.23,4.69,20,12.59,26.46C471,299,476.19,301,480.71,304c13.54,8.81,19.54,27,13.68,41.38,5.9,1.69,12,3.45,16.8,7.15s8.18,9.84,6.6,15.5c-1.83,6.58-9.7,10.13-16.82,9.67-6.54-.41-13.63-3.67-19.31-6.64C471.36,378.79,463,423.23,442.21,407Z",
        "M428.42,400.78c-4.13,5.31-11.28,6.48-17.24,9.3s-11.57,10.21-8.12,15.9c1.78,2.94,5.27,4.07,8.28,5.58C425,438.4,431,457.87,423.91,472s-26.05,20.34-39.35,12.82c3-8.71-.38-19.2-7.72-24.17s-18-4-24.51,2.34c7.4,11,3.42,28.53-8,35.22s-27.65,1-32.61-11.45c-1.43-3.59-2.06-7.62-4.3-10.71-5.74-7.94-18-5.24-26.28,0S264.52,488.66,255,487.76c-3.41-.32-6.92-1.94-8.49-5.09-3-6,2.42-13,7.88-16.95s12.15-8.07,12.78-14.9c1.13-12.13-16.36-15.36-22.41-25.66-5.37-9.14.22-21.88,8.93-27.9s19.47-7.27,29.71-9.13,21.1-4.94,27.85-13.26c3.57-4.39,5.64-9.86,8.74-14.61,9.28-14.25,28.39-20.57,43.57-14.4,1.77-6.22,3.63-12.6,7.52-17.69s10.36-8.61,16.32-6.94c6.92,1.93,10.66,10.21,10.18,17.71-.44,6.87-3.87,14.34-7,20.32C398.73,370.11,445.51,378.87,428.42,400.78Z",
        "M421.88,415.3c5.58,4.35,6.81,11.87,9.78,18.15s10.75,12.18,16.74,8.55c3.1-1.88,4.29-5.55,5.88-8.72,7.19-14.36,27.68-20.73,42.6-13.23s21.4,27.42,13.49,41.42c-9.17-3.12-20.21.4-25.44,8.13s-4.17,18.92,2.46,25.8c11.59-7.79,30-3.6,37.07,8.43s1,29.1-12.05,34.33c-3.78,1.5-8,2.16-11.27,4.52-8.37,6.05-5.52,18.94,0,27.67s13.23,17.48,12.29,27.56c-.33,3.58-2,7.28-5.36,8.93-6.34,3.18-13.72-2.55-17.84-8.3s-8.49-12.78-15.68-13.45c-12.77-1.19-16.17,17.22-27,23.59-9.62,5.66-23-.23-29.37-9.39s-7.66-20.5-9.62-31.28-5.2-22.21-13.95-29.32c-4.62-3.75-10.37-5.94-15.38-9.2-15-9.76-21.65-29.88-15.16-45.86-6.54-1.86-13.26-3.82-18.62-7.92s-9.06-10.91-7.31-17.17c2-7.29,10.75-11.22,18.65-10.72,7.23.46,15.09,4.07,21.39,7.36C389.59,446.56,398.81,397.31,421.88,415.3Z",
        "M437.15,422.19c4.59-5.88,12.51-7.17,19.12-10.3s12.81-11.31,9-17.62c-2-3.26-5.84-4.51-9.18-6.19-15.12-7.57-21.81-29.14-13.92-44.84S471,320.71,485.76,329c-3.29,9.65.42,21.27,8.56,26.78s19.91,4.38,27.15-2.59c-8.2-12.2-3.78-31.62,8.87-39s30.64-1.1,36.14,12.69c1.58,4,2.28,8.43,4.76,11.86,6.37,8.8,19.94,5.81,29.13,0s18.4-13.93,29-12.93c3.78.35,7.67,2.15,9.41,5.63,3.35,6.69-2.68,14.46-8.74,18.78s-13.45,8.95-14.16,16.51c-1.25,13.45,18.14,17,24.84,28.44,5.95,10.13-.25,24.24-9.89,30.91s-21.58,8.06-32.92,10.12S574.53,441.69,567,450.9c-3.95,4.86-6.25,10.92-9.68,16.2-10.28,15.78-31.46,22.78-48.28,15.95-2,6.88-4,14-8.33,19.59s-11.48,9.54-18.08,7.7C475,508.2,470.86,499,471.39,490.72c.48-7.62,4.29-15.89,7.75-22.52C470.06,456.18,418.23,446.47,437.15,422.19Z",
        "M444.41,406.11c-6.19-4.83-7.55-13.16-10.84-20.12S421.66,372.5,415,376.52c-3.43,2.08-4.75,6.15-6.51,9.67-8,15.91-30.68,23-47.2,14.65s-23.72-30.38-15-45.89c10.17,3.46,22.4-.45,28.2-9s4.61-21-2.73-28.59c-12.84,8.63-33.28,4-41.08-9.34s-1.15-32.25,13.36-38c4.18-1.67,8.88-2.4,12.49-5,9.26-6.71,6.11-21,0-30.66S341.92,214.93,343,203.77c.38-4,2.27-8.07,5.94-9.9,7-3.52,15.21,2.82,19.77,9.2s9.41,14.16,17.38,14.9C400.2,219.29,404,198.89,416,191.83c10.66-6.27,25.52.26,32.54,10.41S457,225,459.17,236.9s5.76,24.61,15.46,32.48c5.12,4.16,11.5,6.59,17.05,10.2,16.61,10.82,24,33.11,16.79,50.81,7.25,2.07,14.7,4.24,20.63,8.77s10,12.09,8.1,19c-2.25,8.07-11.91,12.43-20.66,11.87-8-.51-16.72-4.51-23.7-8.15C480.19,371.47,470,426,444.41,406.11Z",
        "M427.48,398.47c-5.08,6.52-13.85,7.95-21.18,11.41s-14.19,12.53-10,19.52c2.19,3.62,6.47,5,10.17,6.86,16.75,8.39,24.17,32.29,15.43,49.69s-32,25-48.31,15.74c3.64-10.7-.47-23.58-9.48-29.68s-22.07-4.86-30.1,2.87c9.09,13.52,4.2,35-9.82,43.24s-34,1.21-40-14.06c-1.76-4.4-2.53-9.35-5.28-13.14-7.05-9.76-22.09-6.44-32.27,0s-20.39,15.43-32.14,14.34c-4.19-.4-8.49-2.39-10.43-6.25-3.7-7.41,3-16,9.68-20.81s14.91-9.91,15.69-18.29c1.39-14.9-20.09-18.87-27.52-31.51-6.59-11.22.28-26.86,11-34.25s23.91-8.94,36.47-11.22,25.91-6.06,34.2-16.27c4.38-5.39,6.93-12.1,10.73-18,11.39-17.49,34.86-25.24,53.49-17.68,2.18-7.62,4.46-15.46,9.23-21.71s12.73-10.57,20-8.53c8.5,2.38,13.09,12.54,12.5,21.75-.54,8.44-4.75,17.6-8.59,24.95C391,360.81,448.46,371.57,427.48,398.47Z",
        "M419.44,416.29c6.86,5.35,8.37,14.58,12,22.29s13.2,14.95,20.55,10.49c3.81-2.3,5.27-6.81,7.22-10.71,8.83-17.63,34-25.44,52.3-16.23s26.29,33.66,16.57,50.84c-11.26-3.83-24.81.5-31.24,10s-5.11,23.23,3,31.67c14.23-9.56,36.88-4.41,45.52,10.35s1.27,35.73-14.8,42.15c-4.64,1.85-9.84,2.66-13.84,5.55-10.26,7.43-6.77,23.26,0,34s16.24,21.47,15.09,33.84c-.41,4.4-2.51,8.93-6.58,11-7.79,3.9-16.86-3.13-21.9-10.19s-10.43-15.7-19.26-16.52c-15.68-1.46-19.85,21.15-33.16,29-11.82,6.94-28.28-.29-36.06-11.54s-9.4-25.17-11.8-38.4-6.39-27.27-17.13-36c-5.68-4.62-12.74-7.3-18.89-11.3-18.41-12-26.58-36.69-18.61-56.3-8-2.29-16.28-4.7-22.86-9.72s-11.12-13.4-9-21.09c2.49-8.95,13.19-13.78,22.89-13.16,8.88.56,18.53,5,26.26,9C379.8,454.67,391.13,394.21,419.44,416.29Z",
        "M438.2,424.75c5.63-7.22,15.35-8.8,23.47-12.64s15.73-13.89,11-21.63c-2.43-4-7.18-5.55-11.27-7.6-18.56-9.3-26.78-35.78-17.1-55.06s35.44-27.66,53.53-17.44c-4,11.86.52,26.12,10.51,32.89s24.45,5.38,33.34-3.18c-10.07-15-4.65-38.82,10.89-47.91s37.62-1.34,44.37,15.58c1.94,4.87,2.8,10.35,5.84,14.56,7.82,10.81,24.48,7.13,35.76,0s22.59-17.1,35.62-15.88c4.63.43,9.4,2.64,11.54,6.92,4.11,8.21-3.29,17.75-10.72,23.06s-16.52,11-17.39,20.27c-1.53,16.5,22.26,20.9,30.5,34.91,7.3,12.43-.31,29.77-12.15,38s-26.49,9.9-40.42,12.43-28.7,6.72-37.89,18c-4.85,6-7.68,13.41-11.89,19.88-12.62,19.38-38.62,28-59.27,19.59-2.41,8.45-4.94,17.14-10.23,24.06s-14.1,11.71-22.2,9.45c-9.42-2.63-14.5-13.89-13.85-24.09.59-9.36,5.26-19.51,9.51-27.66C478.6,466.48,415,454.56,438.2,424.75Z",
        "M447.11,405c-7.6-5.93-9.27-16.16-13.31-24.7S419.18,363.75,411,368.68c-4.22,2.55-5.84,7.55-8,11.87-9.79,19.53-37.66,28.19-57.95,18S316,361.24,326.72,342.2c12.48,4.25,27.49-.55,34.61-11.06S367,305.4,358,296c-15.77,10.6-40.86,4.89-50.43-11.46S306.14,245,324,237.87c5.14-2.05,10.9-2.94,15.33-6.15,11.38-8.23,7.51-25.77,0-37.64s-18-23.78-16.72-37.49c.45-4.88,2.78-9.9,7.29-12.16,8.63-4.32,18.67,3.47,24.27,11.3s11.55,17.39,21.33,18.3c17.38,1.61,22-23.44,36.75-32.1,13.09-7.69,31.33.32,39.95,12.78s10.42,27.89,13.08,42.55,7.07,30.21,19,39.88c6.29,5.11,14.12,8.09,20.93,12.52,20.4,13.28,29.45,40.65,20.62,62.39,8.9,2.54,18,5.2,25.32,10.77s12.33,14.84,9.95,23.37c-2.77,9.91-14.62,15.26-25.36,14.58-9.85-.63-20.53-5.55-29.11-10C491,362.48,478.48,429.47,447.11,405Z",
        "M426.32,395.63c-6.24,8-17,9.76-26,14s-17.43,15.39-12.23,24c2.68,4.43,8,6.14,12.49,8.42,20.56,10.3,29.67,39.64,18.94,61s-39.26,30.65-59.31,19.33c4.47-13.14-.58-28.95-11.65-36.44s-27.09-6-36.94,3.52c11.16,16.6,5.15,43-12.07,53.09s-41.68,1.48-49.16-17.26c-2.15-5.41-3.1-11.48-6.47-16.14-8.66-12-27.13-7.9-39.63,0s-25,18.94-39.46,17.6c-5.14-.48-10.42-2.93-12.79-7.68-4.56-9.09,3.65-19.66,11.88-25.54s18.31-12.17,19.27-22.46c1.7-18.29-24.67-23.16-33.79-38.68-8.1-13.78.34-33,13.46-42.06s29.35-11,44.78-13.77,31.81-7.44,42-20c5.37-6.62,8.5-14.86,13.17-22,14-21.47,42.79-31,65.67-21.7,2.67-9.37,5.47-19,11.34-26.66s15.62-13,24.6-10.47c10.43,2.91,16.06,15.39,15.35,26.7-.67,10.36-5.84,21.61-10.55,30.64C381.56,349.39,452.07,362.6,426.32,395.63Z",
        "M416.45,417.51c8.43,6.57,10.27,17.9,14.75,27.37s16.2,18.35,25.23,12.88c4.67-2.83,6.47-8.37,8.86-13.15C476.14,423,507,413.37,529.51,424.67S561.77,466,549.85,487.1c-13.83-4.7-30.47.62-38.36,12.26s-6.28,28.52,3.71,38.89c17.47-11.74,45.28-5.42,55.88,12.7s1.57,43.87-18.17,51.75c-5.69,2.27-12.07,3.26-17,6.81-12.61,9.12-8.32,28.56,0,41.71s20,26.36,18.53,41.54c-.51,5.41-3.09,11-8.08,13.47-9.56,4.79-20.69-3.84-26.89-12.51s-12.8-19.27-23.64-20.28c-19.25-1.79-24.38,26-40.72,35.57-14.5,8.52-34.71-.36-44.27-14.17s-11.54-30.9-14.49-47.14-7.84-33.48-21-44.19c-7-5.67-15.65-9-23.2-13.88-22.6-14.71-32.63-45-22.85-69.12-9.85-2.81-20-5.76-28.06-11.93s-13.65-16.45-11-25.89c3.07-11,16.2-16.92,28.1-16.16,10.92.69,22.76,6.14,32.25,11.1C367.78,464.63,381.69,390.4,416.45,417.51Z",
        "M439.48,427.9c6.92-8.87,18.85-10.81,28.81-15.52s19.32-17.06,13.56-26.56c-3-4.92-8.81-6.81-13.84-9.33-22.78-11.42-32.88-43.93-21-67.6s43.51-34,65.72-21.41c-4.95,14.56.64,32.07,12.9,40.38s30,6.61,40.94-3.91c-12.36-18.39-5.71-47.65,13.37-58.82s46.18-1.64,54.47,19.13c2.39,6,3.43,12.71,7.17,17.88,9.6,13.27,30.06,8.75,43.91,0s27.74-21,43.72-19.5c5.7.53,11.55,3.25,14.18,8.5,5.05,10.07-4,21.78-13.17,28.31S710,332.92,708.89,344.32C707,364.59,736.22,370,746.33,387.18c9,15.27-.38,36.55-14.92,46.6S698.89,445.93,681.79,449s-35.24,8.25-46.52,22.13c-6,7.33-9.43,16.47-14.6,24.42-15.49,23.79-47.41,34.34-72.76,24.05-3,10.37-6.07,21-12.57,29.53s-17.31,14.38-27.25,11.6c-11.56-3.23-17.8-17-17-29.58.73-11.48,6.47-24,11.68-34C489.08,479.13,411,464.49,439.48,427.9Z",
        "M450.42,403.66c-9.33-7.28-11.38-19.84-16.34-30.33s-17.95-20.33-28-14.27c-5.17,3.13-7.16,9.27-9.81,14.57-12,24-46.25,34.61-71.16,22.09s-35.75-45.79-22.54-69.18c15.32,5.22,33.76-.68,42.5-13.58s7-31.6-4.11-43.09c-19.35,13-50.16,6-61.91-14.07s-1.74-48.61,20.13-57.34c6.3-2.52,13.38-3.62,18.82-7.55,14-10.1,9.22-31.64,0-46.22s-22.1-29.2-20.53-46c.56-6,3.42-12.16,8.95-14.93,10.6-5.31,22.93,4.26,29.8,13.87s14.19,21.35,26.19,22.46c21.34,2,27-28.77,45.12-39.41,16.07-9.44,38.47.4,49.05,15.7s12.79,34.24,16.06,52.24,8.68,37.09,23.3,49c7.72,6.27,17.33,9.92,25.7,15.37,25,16.3,36.15,49.9,25.31,76.59,10.93,3.11,22.15,6.38,31.09,13.22s15.14,18.22,12.22,28.69c-3.4,12.17-17.95,18.74-31.14,17.9-12.09-.77-25.21-6.8-35.74-12.3C504.35,351.45,488.94,433.69,450.42,403.66Z",
        "M424.9,392.14c-7.66,9.83-20.88,12-31.92,17.2s-21.4,18.9-15,29.43c3.3,5.45,9.76,7.54,15.33,10.34,25.25,12.65,36.43,48.67,23.26,74.89s-48.21,37.64-72.82,23.73c5.49-16.12-.71-35.53-14.3-44.73s-33.26-7.33-45.35,4.32c13.69,20.38,6.32,52.81-14.82,65.17s-51.17,1.83-60.35-21.19c-2.65-6.63-3.81-14.08-7.95-19.81-10.64-14.7-33.31-9.7-48.65,0s-30.74,23.26-48.45,21.61c-6.31-.59-12.8-3.6-15.71-9.42-5.59-11.16,4.48-24.14,14.59-31.37s22.48-14.93,23.65-27.57c2.09-22.45-30.28-28.43-41.48-47.49-9.94-16.92.42-40.49,16.52-51.63s36-13.47,55-16.91,39.05-9.14,51.54-24.52c6.61-8.13,10.45-18.25,16.18-27.06,17.17-26.36,52.54-38.05,80.63-26.64,3.28-11.5,6.71-23.32,13.91-32.73s19.19-15.93,30.2-12.85c12.81,3.57,19.73,18.89,18.85,32.77-.81,12.73-7.17,26.54-13,37.62C369.94,335.38,456.52,351.6,424.9,392.14Z",
        "M412.78,419c10.34,8.06,12.61,22,18.11,33.6s19.89,22.52,31,15.81c5.74-3.47,7.94-10.27,10.88-16.14,13.32-26.58,51.24-38.35,78.84-24.48s39.62,50.74,25,76.65c-17-5.78-37.41.75-47.09,15.05s-7.71,35,4.55,47.74c21.45-14.41,55.59-6.65,68.61,15.6s1.92,53.86-22.31,63.53c-7,2.79-14.83,4-20.86,8.37-15.47,11.19-10.21,35,0,51.21s24.49,32.35,22.75,51c-.62,6.64-3.79,13.48-9.92,16.54-11.74,5.88-25.4-4.72-33-15.36s-15.72-23.66-29-24.89c-23.63-2.2-29.92,31.87-50,43.66-17.8,10.46-42.62-.44-54.35-17.39s-14.17-37.94-17.79-57.88-9.62-41.1-25.82-54.26c-8.55-7-19.2-11-28.47-17-27.75-18.07-40.06-55.3-28-84.87-12.1-3.45-24.55-7.07-34.45-14.65S254.57,510.62,257.81,499c3.76-13.48,19.89-20.76,34.5-19.83,13.39.85,27.93,7.54,39.59,13.62C353,476.86,370.1,385.73,412.78,419Z",
        "M441.06,431.76c8.49-10.88,23.14-13.27,35.37-19.05s23.71-20.94,16.64-32.61c-3.65-6-10.81-8.36-17-11.45-28-14-40.36-53.94-25.76-83S503.73,244,531,259.37c-6.08,17.86.79,39.37,15.84,49.56s36.86,8.12,50.26-4.79c-15.18-22.57-7-58.51,16.41-72.21s56.7-2,66.88,23.48c2.93,7.35,4.22,15.6,8.81,22,11.78,16.29,36.9,10.75,53.9,0s34.06-25.78,53.68-23.94c7,.65,14.18,4,17.41,10.43,6.19,12.37-5,26.75-16.17,34.76s-24.9,16.55-26.2,30.55c-2.32,24.88,33.55,31.5,46,52.62,11,18.74-.46,44.87-18.31,57.21s-39.93,14.92-60.92,18.73-43.27,10.13-57.12,27.18c-7.31,9-11.57,20.22-17.92,30-19,29.21-58.21,42.17-89.34,29.53-3.63,12.74-7.44,25.83-15.42,36.26s-21.26,17.65-33.46,14.25c-14.19-4-21.86-20.94-20.88-36.32.9-14.1,7.94-29.4,14.34-41.68C502,494.66,406,476.69,441.06,431.76Z",
        "M454.49,402c-11.46-8.94-14-24.36-20.06-37.23s-22-25-34.33-17.52c-6.35,3.84-8.79,11.38-12.05,17.88-14.76,29.45-56.78,42.49-87.36,27.12S256.8,336,273,307.32c18.81,6.41,41.44-.83,52.17-16.67s8.55-38.8-5-52.9c-23.77,16-61.59,7.37-76-17.28s-2.12-59.69,24.72-70.4c7.74-3.09,16.43-4.44,23.11-9.27,17.15-12.4,11.31-38.85,0-56.74s-27.14-35.85-25.2-56.51c.68-7.36,4.19-14.93,11-18.32,13-6.52,28.15,5.22,36.58,17s17.42,26.21,32.16,27.58c26.19,2.44,33.17-35.32,55.4-48.38,19.72-11.59,47.23.49,60.22,19.27s15.7,42,19.71,64.13S492.47,134.4,510.41,149c9.48,7.7,21.28,12.19,31.55,18.87,30.75,20,44.38,61.27,31.08,94,13.41,3.82,27.19,7.83,38.17,16.23s18.58,22.38,15,35.22c-4.18,14.94-22,23-38.23,22-14.85-.95-31-8.36-43.88-15.1C520.7,337.9,501.78,438.87,454.49,402Z",
        "M423.16,387.86c-9.41,12.06-25.64,14.71-39.2,21.12s-26.27,23.2-18.44,36.13c4.05,6.69,12,9.26,18.83,12.69,31,15.53,44.73,59.76,28.55,91.95S353.72,596,323.5,578.88c6.74-19.79-.88-43.62-17.55-54.92s-40.84-9-55.69,5.31c16.81,25,7.76,64.83-18.19,80s-62.82,2.24-74.1-26c-3.25-8.15-4.67-17.29-9.76-24.32-13.06-18.05-40.89-11.91-59.73,0S50.75,587.52,29,585.48c-7.74-.72-15.71-4.41-19.29-11.56-6.86-13.7,5.5-29.63,17.92-38.51s27.59-18.33,29-33.85C59.23,474,19.48,466.65,5.73,443.25c-12.2-20.76.52-49.71,20.29-63.39s44.25-16.53,67.51-20.75,47.94-11.22,63.28-30.11c8.11-10,12.83-22.4,19.87-33.22,21.07-32.36,64.49-46.71,99-32.71,4-14.12,8.25-28.63,17.09-40.18s23.55-19.56,37.08-15.78C345.55,211.5,354,230.3,353,247.35c-1,15.62-8.79,32.58-15.89,46.18C355.68,318.17,462,338.08,423.16,387.86Z",
        "M408.28,420.84c12.69,9.9,15.48,27,22.22,41.26s24.42,27.65,38,19.41c7-4.26,9.74-12.61,13.35-19.82,16.35-32.62,62.91-47.08,96.8-30.05s48.63,62.3,30.66,94.1c-20.84-7.09-45.92.93-57.81,18.48s-9.47,43,5.59,58.62c26.33-17.7,68.24-8.17,84.23,19.15s2.35,66.13-27.39,78c-8.58,3.42-18.2,4.92-25.61,10.27-19,13.74-12.53,43,0,62.87s30.07,39.72,27.93,62.61c-.76,8.16-4.65,16.54-12.17,20.31-14.43,7.22-31.2-5.79-40.54-18.86s-19.3-29.05-35.63-30.57c-29-2.7-36.75,39.14-61.38,53.61-21.86,12.85-52.33-.54-66.72-21.35S382.46,792.3,378,767.82s-11.81-50.46-31.69-66.62c-10.51-8.53-23.59-13.5-35-20.91-34.07-22.18-49.18-67.89-34.44-104.19-14.85-4.24-30.13-8.68-42.29-18S214,533.32,218,519.09c4.62-16.56,24.42-25.5,42.35-24.36,16.45,1,34.3,9.26,48.62,16.73C334.91,491.87,355.88,380,408.28,420.84Z",
    ]
    const widthsArray: number[] = []
    const widths = [...Array(coordinates.length).keys()].fill(0).reduce((prev, curr) => { 
        widthsArray.push(prev);
        return prev * 1.05 
    // }, 0.7169718448170854)
    }, 1.3)
    const baseStyle = (width: number, color: number, stroke?: boolean) => (
        !(color % 2)
        ? {
            fill: 'none', strokeMiterlimit: 10, strokeWidth: `${width}px`, stroke: stroke ? 'url(#linear)' : 'red',
        }
        : {
            fill: 'none', strokeMiterlimit: 10, strokeWidth: `${width}px`, stroke: stroke ? 'url(#p)' : 'red',
        }
    )
    



    
    return (
        // <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 822.96 866.27">
        <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="-70 -90 1050 1050 ">
            <defs>
                <linearGradient id="linear" x1="33%" y1="66%" x2="33%" y2="66%" spreadMethod="pad">
                    <stop offset="0%"   stopColor="#dbdbdb"/>
                    <stop offset="100%" stopColor="#b1e2da"/>
                </linearGradient>
                <filter id="neon">
                    <feFlood floodColor="url(#linear)" floodOpacity="0.5" in="SourceGraphic" />
                    {/* <feFlood floodColor="#c4c4c4" floodOpacity="0.5" in="SourceGraphic" /> */}
                    <feComposite operator="in" in2="SourceGraphic" />
                    <feGaussianBlur stdDeviation="3" />
                    <feComponentTransfer result="glow1">
                    <feFuncA type="linear" slope="6" intercept="0" />
                    </feComponentTransfer>
                    <feMerge>
                    <feMergeNode in="glow1" />
                    <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <linearGradient id="p" x1="33%" y1="66%" x2="33%" y2="66%" spreadMethod="pad">
                    <stop offset="0%"   stopColor="#dbdbdb"/>
                    <stop offset="100%" stopColor="#62ac9f"/>
                </linearGradient>

                <filter id="k">
                    {/* <feFlood flood-color="rgb(255,255,128)" flood-opacity="0.5" in="SourceGraphic" /> */}
                    <feFlood floodColor="url(#p)" floodOpacity="0.5" in="SourceGraphic" />
                    <feComposite operator="in" in2="SourceGraphic" />
                    <feGaussianBlur stdDeviation="3" />
                    <feComponentTransfer result="glow1">
                    <feFuncA type="linear" slope="6" intercept="0" />
                    </feComponentTransfer>
                    <feMerge>
                    <feMergeNode in="glow1" />
                    <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>

            </defs>
            {/* <title>curves</title> */}
            <g transform={rotateBy}>
                { coordinates.map((v, idx, arr) => (
                    // <path transform={rotateBy} d={v} style={baseStyle(widthsArray[idx], sel ? sel === idx : undefined)} className={lineClass} />
                    // <path  d={v} style={baseStyle(widthsArray[idx], sel || sel === 0 ? sel === idx : undefined, true)} className={lineClass} />
                    <path key={idx} d={v} style={baseStyle(widthsArray[idx], idx, true)} className={lineClass} filter={!(idx % 2) ? 'url(#neon)' : 'url(#k)'}/>
                ))}
                {/* <circle cx={cx} cy={cy}  r={5} fill={'url(#grad1)'} /> */}
                {/* <path transform={rotateBy} d="M423.86,414.49c4.55,3.55,5.55,9.67,8,14.79s8.75,9.91,13.63,7c2.52-1.53,3.5-4.52,4.79-7.11,5.86-11.69,22.55-16.88,34.7-10.77s17.43,22.33,11,33.73c-7.47-2.54-16.46.34-20.72,6.63a17.14,17.14,0,0,0,2,21c9.44-6.34,24.46-2.93,30.19,6.87s.85,23.7-9.81,28c-3.08,1.22-6.53,1.76-9.18,3.68-6.81,4.93-4.5,15.43,0,22.54s10.78,14.24,10,22.44c-.27,2.93-1.67,5.93-4.36,7.28-5.17,2.59-11.18-2.07-14.53-6.76s-6.92-10.41-12.78-11c-10.4-1-13.17,14-22,19.22-7.84,4.61-18.76-.19-23.92-7.65s-6.24-16.7-7.83-25.48-4.24-18.09-11.36-23.88c-3.77-3.06-8.46-4.84-12.54-7.49-12.21-7.95-17.63-24.34-12.34-37.35-5.33-1.52-10.8-3.12-15.16-6.45s-7.39-8.89-6-14c1.66-5.94,8.75-9.14,15.18-8.73,5.9.37,12.3,3.32,17.43,6C397.56,440,405.07,399.84,423.86,414.49Z" style={{fill: 'none', strokeMiterlimit: 10, strokeWidth: "0.7169718448170854px"}} className={lineClass}/>
                <path transform={rotateBy} d="M436.3,420.1c3.74-4.79,10.19-5.84,15.57-8.38s10.44-9.22,7.33-14.36c-1.61-2.65-4.76-3.67-7.48-5-12.31-6.17-17.77-23.73-11.34-36.52s23.51-18.36,35.51-11.57c-2.68,7.86.35,17.33,7,21.81A18,18,0,0,0,505,363.93c-6.68-9.93-3.08-25.75,7.23-31.78s24.95-.89,29.43,10.33c1.29,3.24,1.86,6.87,3.88,9.67,5.18,7.17,16.24,4.73,23.72,0s15-11.34,23.63-10.54c3.07.29,6.24,1.76,7.66,4.6,2.72,5.44-2.19,11.77-7.12,15.29s-11,7.29-11.53,13.45c-1,10.95,14.77,13.87,20.23,23.16,4.85,8.25-.21,19.75-8.06,25.18s-17.57,6.57-26.81,8.24-19,4.46-25.14,12c-3.22,4-5.09,8.9-7.89,13.2-8.37,12.85-25.62,18.56-39.32,13-1.6,5.61-3.27,11.37-6.79,16s-9.35,7.77-14.72,6.27c-6.25-1.74-9.62-9.21-9.19-16,.39-6.21,3.49-12.94,6.31-18.35C463.11,447.79,420.89,439.88,436.3,420.1Z" style={{fill: 'none',  strokeMiterlimit: 10, strokeWidth: "0.7547072050706162px"}} className={lineClass}/>
                <path transform={rotateBy} d="M442.21,407c-5-3.93-6.15-10.72-8.82-16.38s-9.71-11-15.11-7.72c-2.8,1.7-3.87,5-5.31,7.88-6.49,13-25,18.7-38.45,11.93S355.21,378,362.34,365.33c8.28,2.82,18.25-.36,23-7.33s3.76-17.08-2.22-23.29c-10.46,7-27.11,3.25-33.46-7.6s-.94-26.27,10.88-31c3.41-1.36,7.23-1.95,10.17-4.08,7.55-5.46,5-17.09,0-25s-11.95-15.78-11.1-24.87c.31-3.24,1.85-6.57,4.84-8.07,5.73-2.86,12.39,2.3,16.1,7.5s7.67,11.53,14.15,12.14c11.53,1.07,14.6-15.55,24.38-21.3,8.69-5.1,20.79.22,26.51,8.48s6.91,18.5,8.68,28.23,4.69,20,12.59,26.46C471,299,476.19,301,480.71,304c13.54,8.81,19.54,27,13.68,41.38,5.9,1.69,12,3.45,16.8,7.15s8.18,9.84,6.6,15.5c-1.83,6.58-9.7,10.13-16.82,9.67-6.54-.41-13.63-3.67-19.31-6.64C471.36,378.79,463,423.23,442.21,407Z" style={{fill: 'none',  strokeMiterlimit: 10, strokeWidth: "0.7944286369164381px"}} className={lineClass}/>
                <path transform={rotateBy} d="M428.42,400.78c-4.13,5.31-11.28,6.48-17.24,9.3s-11.57,10.21-8.12,15.9c1.78,2.94,5.27,4.07,8.28,5.58C425,438.4,431,457.87,423.91,472s-26.05,20.34-39.35,12.82c3-8.71-.38-19.2-7.72-24.17s-18-4-24.51,2.34c7.4,11,3.42,28.53-8,35.22s-27.65,1-32.61-11.45c-1.43-3.59-2.06-7.62-4.3-10.71-5.74-7.94-18-5.24-26.28,0S264.52,488.66,255,487.76c-3.41-.32-6.92-1.94-8.49-5.09-3-6,2.42-13,7.88-16.95s12.15-8.07,12.78-14.9c1.13-12.13-16.36-15.36-22.41-25.66-5.37-9.14.22-21.88,8.93-27.9s19.47-7.27,29.71-9.13,21.1-4.94,27.85-13.26c3.57-4.39,5.64-9.86,8.74-14.61,9.28-14.25,28.39-20.57,43.57-14.4,1.77-6.22,3.63-12.6,7.52-17.69s10.36-8.61,16.32-6.94c6.92,1.93,10.66,10.21,10.18,17.71-.44,6.87-3.87,14.34-7,20.32C398.73,370.11,445.51,378.87,428.42,400.78Z" style={{fill: 'none',  strokeMiterlimit: 10, strokeWidth: "0.8362406704383558px"}} className={lineClass}/>
                <path transform={rotateBy} d="M421.88,415.3c5.58,4.35,6.81,11.87,9.78,18.15s10.75,12.18,16.74,8.55c3.1-1.88,4.29-5.55,5.88-8.72,7.19-14.36,27.68-20.73,42.6-13.23s21.4,27.42,13.49,41.42c-9.17-3.12-20.21.4-25.44,8.13s-4.17,18.92,2.46,25.8c11.59-7.79,30-3.6,37.07,8.43s1,29.1-12.05,34.33c-3.78,1.5-8,2.16-11.27,4.52-8.37,6.05-5.52,18.94,0,27.67s13.23,17.48,12.29,27.56c-.33,3.58-2,7.28-5.36,8.93-6.34,3.18-13.72-2.55-17.84-8.3s-8.49-12.78-15.68-13.45c-12.77-1.19-16.17,17.22-27,23.59-9.62,5.66-23-.23-29.37-9.39s-7.66-20.5-9.62-31.28-5.2-22.21-13.95-29.32c-4.62-3.75-10.37-5.94-15.38-9.2-15-9.76-21.65-29.88-15.16-45.86-6.54-1.86-13.26-3.82-18.62-7.92s-9.06-10.91-7.31-17.17c2-7.29,10.75-11.22,18.65-10.72,7.23.46,15.09,4.07,21.39,7.36C389.59,446.56,398.81,397.31,421.88,415.3Z" style={{fill: 'none',  strokeMiterlimit: 10, strokeWidth: "0.8802533373035324px"}} className={lineClass}/>
                <path transform={rotateBy} d="M437.15,422.19c4.59-5.88,12.51-7.17,19.12-10.3s12.81-11.31,9-17.62c-2-3.26-5.84-4.51-9.18-6.19-15.12-7.57-21.81-29.14-13.92-44.84S471,320.71,485.76,329c-3.29,9.65.42,21.27,8.56,26.78s19.91,4.38,27.15-2.59c-8.2-12.2-3.78-31.62,8.87-39s30.64-1.1,36.14,12.69c1.58,4,2.28,8.43,4.76,11.86,6.37,8.8,19.94,5.81,29.13,0s18.4-13.93,29-12.93c3.78.35,7.67,2.15,9.41,5.63,3.35,6.69-2.68,14.46-8.74,18.78s-13.45,8.95-14.16,16.51c-1.25,13.45,18.14,17,24.84,28.44,5.95,10.13-.25,24.24-9.89,30.91s-21.58,8.06-32.92,10.12S574.53,441.69,567,450.9c-3.95,4.86-6.25,10.92-9.68,16.2-10.28,15.78-31.46,22.78-48.28,15.95-2,6.88-4,14-8.33,19.59s-11.48,9.54-18.08,7.7C475,508.2,470.86,499,471.39,490.72c.48-7.62,4.29-15.89,7.75-22.52C470.06,456.18,418.23,446.47,437.15,422.19Z" style={{fill: 'none',  strokeMiterlimit: 10, strokeWidth: "0.9265824603195078px"}} className={lineClass}/>
                <path transform={rotateBy} d="M444.41,406.11c-6.19-4.83-7.55-13.16-10.84-20.12S421.66,372.5,415,376.52c-3.43,2.08-4.75,6.15-6.51,9.67-8,15.91-30.68,23-47.2,14.65s-23.72-30.38-15-45.89c10.17,3.46,22.4-.45,28.2-9s4.61-21-2.73-28.59c-12.84,8.63-33.28,4-41.08-9.34s-1.15-32.25,13.36-38c4.18-1.67,8.88-2.4,12.49-5,9.26-6.71,6.11-21,0-30.66S341.92,214.93,343,203.77c.38-4,2.27-8.07,5.94-9.9,7-3.52,15.21,2.82,19.77,9.2s9.41,14.16,17.38,14.9C400.2,219.29,404,198.89,416,191.83c10.66-6.27,25.52.26,32.54,10.41S457,225,459.17,236.9s5.76,24.61,15.46,32.48c5.12,4.16,11.5,6.59,17.05,10.2,16.61,10.82,24,33.11,16.79,50.81,7.25,2.07,14.7,4.24,20.63,8.77s10,12.09,8.1,19c-2.25,8.07-11.91,12.43-20.66,11.87-8-.51-16.72-4.51-23.7-8.15C480.19,371.47,470,426,444.41,406.11Z" style={{fill: 'none',  strokeMiterlimit: 10, strokeWidth: "0.9753499582310607px"}} className={lineClass}/>
                <path transform={rotateBy} d="M427.48,398.47c-5.08,6.52-13.85,7.95-21.18,11.41s-14.19,12.53-10,19.52c2.19,3.62,6.47,5,10.17,6.86,16.75,8.39,24.17,32.29,15.43,49.69s-32,25-48.31,15.74c3.64-10.7-.47-23.58-9.48-29.68s-22.07-4.86-30.1,2.87c9.09,13.52,4.2,35-9.82,43.24s-34,1.21-40-14.06c-1.76-4.4-2.53-9.35-5.28-13.14-7.05-9.76-22.09-6.44-32.27,0s-20.39,15.43-32.14,14.34c-4.19-.4-8.49-2.39-10.43-6.25-3.7-7.41,3-16,9.68-20.81s14.91-9.91,15.69-18.29c1.39-14.9-20.09-18.87-27.52-31.51-6.59-11.22.28-26.86,11-34.25s23.91-8.94,36.47-11.22,25.91-6.06,34.2-16.27c4.38-5.39,6.93-12.1,10.73-18,11.39-17.49,34.86-25.24,53.49-17.68,2.18-7.62,4.46-15.46,9.23-21.71s12.73-10.57,20-8.53c8.5,2.38,13.09,12.54,12.5,21.75-.54,8.44-4.75,17.6-8.59,24.95C391,360.81,448.46,371.57,427.48,398.47Z" style={{fill: 'none',  strokeMiterlimit: 10, strokeWidth: "1.0266841665590112px"}} className={lineClass}/>
                <path transform={rotateBy} d="M419.44,416.29c6.86,5.35,8.37,14.58,12,22.29s13.2,14.95,20.55,10.49c3.81-2.3,5.27-6.81,7.22-10.71,8.83-17.63,34-25.44,52.3-16.23s26.29,33.66,16.57,50.84c-11.26-3.83-24.81.5-31.24,10s-5.11,23.23,3,31.67c14.23-9.56,36.88-4.41,45.52,10.35s1.27,35.73-14.8,42.15c-4.64,1.85-9.84,2.66-13.84,5.55-10.26,7.43-6.77,23.26,0,34s16.24,21.47,15.09,33.84c-.41,4.4-2.51,8.93-6.58,11-7.79,3.9-16.86-3.13-21.9-10.19s-10.43-15.7-19.26-16.52c-15.68-1.46-19.85,21.15-33.16,29-11.82,6.94-28.28-.29-36.06-11.54s-9.4-25.17-11.8-38.4-6.39-27.27-17.13-36c-5.68-4.62-12.74-7.3-18.89-11.3-18.41-12-26.58-36.69-18.61-56.3-8-2.29-16.28-4.7-22.86-9.72s-11.12-13.4-9-21.09c2.49-8.95,13.19-13.78,22.89-13.16,8.88.56,18.53,5,26.26,9C379.8,454.67,391.13,394.21,419.44,416.29Z" style={{fill: 'none',  strokeMiterlimit: 10, strokeWidth: "1.0807201753252749px"}} className={lineClass}/>
                <path transform={rotateBy} d="M438.2,424.75c5.63-7.22,15.35-8.8,23.47-12.64s15.73-13.89,11-21.63c-2.43-4-7.18-5.55-11.27-7.6-18.56-9.3-26.78-35.78-17.1-55.06s35.44-27.66,53.53-17.44c-4,11.86.52,26.12,10.51,32.89s24.45,5.38,33.34-3.18c-10.07-15-4.65-38.82,10.89-47.91s37.62-1.34,44.37,15.58c1.94,4.87,2.8,10.35,5.84,14.56,7.82,10.81,24.48,7.13,35.76,0s22.59-17.1,35.62-15.88c4.63.43,9.4,2.64,11.54,6.92,4.11,8.21-3.29,17.75-10.72,23.06s-16.52,11-17.39,20.27c-1.53,16.5,22.26,20.9,30.5,34.91,7.3,12.43-.31,29.77-12.15,38s-26.49,9.9-40.42,12.43-28.7,6.72-37.89,18c-4.85,6-7.68,13.41-11.89,19.88-12.62,19.38-38.62,28-59.27,19.59-2.41,8.45-4.94,17.14-10.23,24.06s-14.1,11.71-22.2,9.45c-9.42-2.63-14.5-13.89-13.85-24.09.59-9.36,5.26-19.51,9.51-27.66C478.6,466.48,415,454.56,438.2,424.75Z" style={{fill: 'none',  strokeMiterlimit: 10, strokeWidth: "1.137600184552921px"}} className={lineClass}/>
                <path transform={rotateBy} d="M447.11,405c-7.6-5.93-9.27-16.16-13.31-24.7S419.18,363.75,411,368.68c-4.22,2.55-5.84,7.55-8,11.87-9.79,19.53-37.66,28.19-57.95,18S316,361.24,326.72,342.2c12.48,4.25,27.49-.55,34.61-11.06S367,305.4,358,296c-15.77,10.6-40.86,4.89-50.43-11.46S306.14,245,324,237.87c5.14-2.05,10.9-2.94,15.33-6.15,11.38-8.23,7.51-25.77,0-37.64s-18-23.78-16.72-37.49c.45-4.88,2.78-9.9,7.29-12.16,8.63-4.32,18.67,3.47,24.27,11.3s11.55,17.39,21.33,18.3c17.38,1.61,22-23.44,36.75-32.1,13.09-7.69,31.33.32,39.95,12.78s10.42,27.89,13.08,42.55,7.07,30.21,19,39.88c6.29,5.11,14.12,8.09,20.93,12.52,20.4,13.28,29.45,40.65,20.62,62.39,8.9,2.54,18,5.2,25.32,10.77s12.33,14.84,9.95,23.37c-2.77,9.91-14.62,15.26-25.36,14.58-9.85-.63-20.53-5.55-29.11-10C491,362.48,478.48,429.47,447.11,405Z" style={{fill: 'none',  strokeMiterlimit: 10, strokeWidth: "1.1974738784767587px"}} className={lineClass}/>
                <path transform={rotateBy} d="M426.32,395.63c-6.24,8-17,9.76-26,14s-17.43,15.39-12.23,24c2.68,4.43,8,6.14,12.49,8.42,20.56,10.3,29.67,39.64,18.94,61s-39.26,30.65-59.31,19.33c4.47-13.14-.58-28.95-11.65-36.44s-27.09-6-36.94,3.52c11.16,16.6,5.15,43-12.07,53.09s-41.68,1.48-49.16-17.26c-2.15-5.41-3.1-11.48-6.47-16.14-8.66-12-27.13-7.9-39.63,0s-25,18.94-39.46,17.6c-5.14-.48-10.42-2.93-12.79-7.68-4.56-9.09,3.65-19.66,11.88-25.54s18.31-12.17,19.27-22.46c1.7-18.29-24.67-23.16-33.79-38.68-8.1-13.78.34-33,13.46-42.06s29.35-11,44.78-13.77,31.81-7.44,42-20c5.37-6.62,8.5-14.86,13.17-22,14-21.47,42.79-31,65.67-21.7,2.67-9.37,5.47-19,11.34-26.66s15.62-13,24.6-10.47c10.43,2.91,16.06,15.39,15.35,26.7-.67,10.36-5.84,21.61-10.55,30.64C381.56,349.39,452.07,362.6,426.32,395.63Z" style={{fill: 'none',  strokeMiterlimit: 10, strokeWidth: "1.2604988194492195px"}} className={lineClass}/>
                <path transform={rotateBy} d="M416.45,417.51c8.43,6.57,10.27,17.9,14.75,27.37s16.2,18.35,25.23,12.88c4.67-2.83,6.47-8.37,8.86-13.15C476.14,423,507,413.37,529.51,424.67S561.77,466,549.85,487.1c-13.83-4.7-30.47.62-38.36,12.26s-6.28,28.52,3.71,38.89c17.47-11.74,45.28-5.42,55.88,12.7s1.57,43.87-18.17,51.75c-5.69,2.27-12.07,3.26-17,6.81-12.61,9.12-8.32,28.56,0,41.71s20,26.36,18.53,41.54c-.51,5.41-3.09,11-8.08,13.47-9.56,4.79-20.69-3.84-26.89-12.51s-12.8-19.27-23.64-20.28c-19.25-1.79-24.38,26-40.72,35.57-14.5,8.52-34.71-.36-44.27-14.17s-11.54-30.9-14.49-47.14-7.84-33.48-21-44.19c-7-5.67-15.65-9-23.2-13.88-22.6-14.71-32.63-45-22.85-69.12-9.85-2.81-20-5.76-28.06-11.93s-13.65-16.45-11-25.89c3.07-11,16.2-16.92,28.1-16.16,10.92.69,22.76,6.14,32.25,11.1C367.78,464.63,381.69,390.4,416.45,417.51Z" style={{fill: 'none',  strokeMiterlimit: 10, strokeWidth: "1.3268408625781256px"}} className={lineClass}/>
                <path transform={rotateBy} d="M439.48,427.9c6.92-8.87,18.85-10.81,28.81-15.52s19.32-17.06,13.56-26.56c-3-4.92-8.81-6.81-13.84-9.33-22.78-11.42-32.88-43.93-21-67.6s43.51-34,65.72-21.41c-4.95,14.56.64,32.07,12.9,40.38s30,6.61,40.94-3.91c-12.36-18.39-5.71-47.65,13.37-58.82s46.18-1.64,54.47,19.13c2.39,6,3.43,12.71,7.17,17.88,9.6,13.27,30.06,8.75,43.91,0s27.74-21,43.72-19.5c5.7.53,11.55,3.25,14.18,8.5,5.05,10.07-4,21.78-13.17,28.31S710,332.92,708.89,344.32C707,364.59,736.22,370,746.33,387.18c9,15.27-.38,36.55-14.92,46.6S698.89,445.93,681.79,449s-35.24,8.25-46.52,22.13c-6,7.33-9.43,16.47-14.6,24.42-15.49,23.79-47.41,34.34-72.76,24.05-3,10.37-6.07,21-12.57,29.53s-17.31,14.38-27.25,11.6c-11.56-3.23-17.8-17-17-29.58.73-11.48,6.47-24,11.68-34C489.08,479.13,411,464.49,439.48,427.9Z" style={{fill: 'none',  strokeMiterlimit: 10, strokeWidth: "1.3966745921875006px"}} className={lineClass}/>
                <path transform={rotateBy} d="M450.42,403.66c-9.33-7.28-11.38-19.84-16.34-30.33s-17.95-20.33-28-14.27c-5.17,3.13-7.16,9.27-9.81,14.57-12,24-46.25,34.61-71.16,22.09s-35.75-45.79-22.54-69.18c15.32,5.22,33.76-.68,42.5-13.58s7-31.6-4.11-43.09c-19.35,13-50.16,6-61.91-14.07s-1.74-48.61,20.13-57.34c6.3-2.52,13.38-3.62,18.82-7.55,14-10.1,9.22-31.64,0-46.22s-22.1-29.2-20.53-46c.56-6,3.42-12.16,8.95-14.93,10.6-5.31,22.93,4.26,29.8,13.87s14.19,21.35,26.19,22.46c21.34,2,27-28.77,45.12-39.41,16.07-9.44,38.47.4,49.05,15.7s12.79,34.24,16.06,52.24,8.68,37.09,23.3,49c7.72,6.27,17.33,9.92,25.7,15.37,25,16.3,36.15,49.9,25.31,76.59,10.93,3.11,22.15,6.38,31.09,13.22s15.14,18.22,12.22,28.69c-3.4,12.17-17.95,18.74-31.14,17.9-12.09-.77-25.21-6.8-35.74-12.3C504.35,351.45,488.94,433.69,450.42,403.66Z" style={{fill: 'none',  strokeMiterlimit: 10, strokeWidth: "1.4701837812500005px"}} className={lineClass}/>
                <path transform={rotateBy} d="M424.9,392.14c-7.66,9.83-20.88,12-31.92,17.2s-21.4,18.9-15,29.43c3.3,5.45,9.76,7.54,15.33,10.34,25.25,12.65,36.43,48.67,23.26,74.89s-48.21,37.64-72.82,23.73c5.49-16.12-.71-35.53-14.3-44.73s-33.26-7.33-45.35,4.32c13.69,20.38,6.32,52.81-14.82,65.17s-51.17,1.83-60.35-21.19c-2.65-6.63-3.81-14.08-7.95-19.81-10.64-14.7-33.31-9.7-48.65,0s-30.74,23.26-48.45,21.61c-6.31-.59-12.8-3.6-15.71-9.42-5.59-11.16,4.48-24.14,14.59-31.37s22.48-14.93,23.65-27.57c2.09-22.45-30.28-28.43-41.48-47.49-9.94-16.92.42-40.49,16.52-51.63s36-13.47,55-16.91,39.05-9.14,51.54-24.52c6.61-8.13,10.45-18.25,16.18-27.06,17.17-26.36,52.54-38.05,80.63-26.64,3.28-11.5,6.71-23.32,13.91-32.73s19.19-15.93,30.2-12.85c12.81,3.57,19.73,18.89,18.85,32.77-.81,12.73-7.17,26.54-13,37.62C369.94,335.38,456.52,351.6,424.9,392.14Z" style={{fill: 'none',  strokeMiterlimit: 10, strokeWidth: "1.5475618750000004px"}} className={lineClass}/>
                <path transform={rotateBy} d="M412.78,419c10.34,8.06,12.61,22,18.11,33.6s19.89,22.52,31,15.81c5.74-3.47,7.94-10.27,10.88-16.14,13.32-26.58,51.24-38.35,78.84-24.48s39.62,50.74,25,76.65c-17-5.78-37.41.75-47.09,15.05s-7.71,35,4.55,47.74c21.45-14.41,55.59-6.65,68.61,15.6s1.92,53.86-22.31,63.53c-7,2.79-14.83,4-20.86,8.37-15.47,11.19-10.21,35,0,51.21s24.49,32.35,22.75,51c-.62,6.64-3.79,13.48-9.92,16.54-11.74,5.88-25.4-4.72-33-15.36s-15.72-23.66-29-24.89c-23.63-2.2-29.92,31.87-50,43.66-17.8,10.46-42.62-.44-54.35-17.39s-14.17-37.94-17.79-57.88-9.62-41.1-25.82-54.26c-8.55-7-19.2-11-28.47-17-27.75-18.07-40.06-55.3-28-84.87-12.1-3.45-24.55-7.07-34.45-14.65S254.57,510.62,257.81,499c3.76-13.48,19.89-20.76,34.5-19.83,13.39.85,27.93,7.54,39.59,13.62C353,476.86,370.1,385.73,412.78,419Z" style={{fill: 'none',  strokeMiterlimit: 10, strokeWidth: "1.6290125000000004px"}} className={lineClass}/>
                <path transform={rotateBy} d="M441.06,431.76c8.49-10.88,23.14-13.27,35.37-19.05s23.71-20.94,16.64-32.61c-3.65-6-10.81-8.36-17-11.45-28-14-40.36-53.94-25.76-83S503.73,244,531,259.37c-6.08,17.86.79,39.37,15.84,49.56s36.86,8.12,50.26-4.79c-15.18-22.57-7-58.51,16.41-72.21s56.7-2,66.88,23.48c2.93,7.35,4.22,15.6,8.81,22,11.78,16.29,36.9,10.75,53.9,0s34.06-25.78,53.68-23.94c7,.65,14.18,4,17.41,10.43,6.19,12.37-5,26.75-16.17,34.76s-24.9,16.55-26.2,30.55c-2.32,24.88,33.55,31.5,46,52.62,11,18.74-.46,44.87-18.31,57.21s-39.93,14.92-60.92,18.73-43.27,10.13-57.12,27.18c-7.31,9-11.57,20.22-17.92,30-19,29.21-58.21,42.17-89.34,29.53-3.63,12.74-7.44,25.83-15.42,36.26s-21.26,17.65-33.46,14.25c-14.19-4-21.86-20.94-20.88-36.32.9-14.1,7.94-29.4,14.34-41.68C502,494.66,406,476.69,441.06,431.76Z" style={{fill: 'none',  strokeMiterlimit: 10, strokeWidth: "1.7147500000000002px"}} className={lineClass}/>
                <path transform={rotateBy} d="M454.49,402c-11.46-8.94-14-24.36-20.06-37.23s-22-25-34.33-17.52c-6.35,3.84-8.79,11.38-12.05,17.88-14.76,29.45-56.78,42.49-87.36,27.12S256.8,336,273,307.32c18.81,6.41,41.44-.83,52.17-16.67s8.55-38.8-5-52.9c-23.77,16-61.59,7.37-76-17.28s-2.12-59.69,24.72-70.4c7.74-3.09,16.43-4.44,23.11-9.27,17.15-12.4,11.31-38.85,0-56.74s-27.14-35.85-25.2-56.51c.68-7.36,4.19-14.93,11-18.32,13-6.52,28.15,5.22,36.58,17s17.42,26.21,32.16,27.58c26.19,2.44,33.17-35.32,55.4-48.38,19.72-11.59,47.23.49,60.22,19.27s15.7,42,19.71,64.13S492.47,134.4,510.41,149c9.48,7.7,21.28,12.19,31.55,18.87,30.75,20,44.38,61.27,31.08,94,13.41,3.82,27.19,7.83,38.17,16.23s18.58,22.38,15,35.22c-4.18,14.94-22,23-38.23,22-14.85-.95-31-8.36-43.88-15.1C520.7,337.9,501.78,438.87,454.49,402Z" style={{fill: 'none',  strokeMiterlimit: 10, strokeWidth: "1.8050000000000002px"}} className={lineClass}/>
                <path transform={rotateBy} d="M423.16,387.86c-9.41,12.06-25.64,14.71-39.2,21.12s-26.27,23.2-18.44,36.13c4.05,6.69,12,9.26,18.83,12.69,31,15.53,44.73,59.76,28.55,91.95S353.72,596,323.5,578.88c6.74-19.79-.88-43.62-17.55-54.92s-40.84-9-55.69,5.31c16.81,25,7.76,64.83-18.19,80s-62.82,2.24-74.1-26c-3.25-8.15-4.67-17.29-9.76-24.32-13.06-18.05-40.89-11.91-59.73,0S50.75,587.52,29,585.48c-7.74-.72-15.71-4.41-19.29-11.56-6.86-13.7,5.5-29.63,17.92-38.51s27.59-18.33,29-33.85C59.23,474,19.48,466.65,5.73,443.25c-12.2-20.76.52-49.71,20.29-63.39s44.25-16.53,67.51-20.75,47.94-11.22,63.28-30.11c8.11-10,12.83-22.4,19.87-33.22,21.07-32.36,64.49-46.71,99-32.71,4-14.12,8.25-28.63,17.09-40.18s23.55-19.56,37.08-15.78C345.55,211.5,354,230.3,353,247.35c-1,15.62-8.79,32.58-15.89,46.18C355.68,318.17,462,338.08,423.16,387.86Z" style={{fill: 'none',  strokeMiterlimit: 10, strokeWidth: "1.9000000000000001px"}} className={lineClass}/>
                <path transform={rotateBy} d="M408.28,420.84c12.69,9.9,15.48,27,22.22,41.26s24.42,27.65,38,19.41c7-4.26,9.74-12.61,13.35-19.82,16.35-32.62,62.91-47.08,96.8-30.05s48.63,62.3,30.66,94.1c-20.84-7.09-45.92.93-57.81,18.48s-9.47,43,5.59,58.62c26.33-17.7,68.24-8.17,84.23,19.15s2.35,66.13-27.39,78c-8.58,3.42-18.2,4.92-25.61,10.27-19,13.74-12.53,43,0,62.87s30.07,39.72,27.93,62.61c-.76,8.16-4.65,16.54-12.17,20.31-14.43,7.22-31.2-5.79-40.54-18.86s-19.3-29.05-35.63-30.57c-29-2.7-36.75,39.14-61.38,53.61-21.86,12.85-52.33-.54-66.72-21.35S382.46,792.3,378,767.82s-11.81-50.46-31.69-66.62c-10.51-8.53-23.59-13.5-35-20.91-34.07-22.18-49.18-67.89-34.44-104.19-14.85-4.24-30.13-8.68-42.29-18S214,533.32,218,519.09c4.62-16.56,24.42-25.5,42.35-24.36,16.45,1,34.3,9.26,48.62,16.73C334.91,491.87,355.88,380,408.28,420.84Z" style={{fill: 'none', strokeMiterlimit: 10, strokeWidth: "2px"}} className={lineClass}/> */}

            </g>
        </svg>
    )
}

export default Curves;