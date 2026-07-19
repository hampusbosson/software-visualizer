import type { GraphResponse } from '../../../types/graph'

export const mockGraphResponse: GraphResponse = {
  projectName: 'backend',
  edges: [
    {
      source: 'com.example.course.CourseController',
      target: 'com.example.course.CourseService',
      type: 'DEPENDS_ON',
    },
    {
      source: 'com.example.course.CourseService',
      target: 'com.example.course.CourseRepository',
      type: 'DEPENDS_ON',
    },
  ],
  nodes: [
    {
      id: 'com.example.BackendApplication',
      label: 'BackendApplication',
      type: 'APPLICATION',
      packageName: 'com.example',
    },
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
