import type { GraphResponse } from '../../../types/graph'

export const mockGraphResponse: GraphResponse = {
  projectName: 'backend',
  edges: [],
  nodes: [
    {
      id: 'com.example.course.CourseController',
      label: 'CourseController',
      type: 'CONTROLLER',
      packageName: 'com.example.course',
    },
    {
      id: 'com.example.course.CourseService',
      label: 'CourseService',
      type: 'SERVICE',
      packageName: 'com.example.course',
    },
    {
      id: 'com.example.course.CourseRepository',
      label: 'CourseRepository',
      type: 'REPOSITORY',
      packageName: 'com.example.course',
    },
    {
      id: 'com.example.course.Course',
      label: 'Course',
      type: 'ENTITY',
      packageName: 'com.example.course',
    },
    {
      id: 'com.example.course.CourseResponseDto',
      label: 'CourseResponseDto',
      type: 'DTO',
      packageName: 'com.example.course',
    },
    {
      id: 'com.example.config.SecurityConfig',
      label: 'SecurityConfig',
      type: 'CONFIGURATION',
      packageName: 'com.example.config',
    },
    {
      id: 'com.example.shared.SlugComponent',
      label: 'SlugComponent',
      type: 'COMPONENT',
      packageName: 'com.example.shared',
    },
  ],
}
