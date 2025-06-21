import { apiSlice } from '../api/apiSlice';

export const availabilityApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get current user's availability for a band
    getUserAvailability: builder.query({
      query: (bandId) => `/availability/user?bandId=${bandId}`,
      providesTags: (result, error, arg) => [
        { type: 'UserAvailability', id: arg }
      ],
    }),
    
    // Get all band members' availability
    getBandAvailability: builder.query({
      query: (bandId) => `/availability/band/${bandId}`,
      providesTags: (result, error, arg) => [
        { type: 'BandAvailability', id: arg }
      ],
    }),
    
    // Set/create availability
    setAvailability: builder.mutation({
      query: (data) => ({
        url: '/availability',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'UserAvailability', id: arg.bandId },
        { type: 'BandAvailability', id: arg.bandId }
      ],
    }),
    
    // Update availability
    updateAvailability: builder.mutation({
      query: (data) => ({
        url: `/availability/${data.id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'UserAvailability', id: arg.bandId },
        { type: 'BandAvailability', id: arg.bandId }
      ],
    }),
    
    // Delete availability
    deleteAvailability: builder.mutation({
      query: (id) => ({
        url: `/availability/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'UserAvailability' },
        { type: 'BandAvailability' }
      ],
    }),
    
    // Get optimal times for rehearsals based on availability
    findOptimalTimes: builder.query({
      query: ({ bandId, duration = 120, requiredMembers = [] }) => {
        let url = `/availability/optimal/${bandId}?duration=${duration}`;
        
        // Add required members to query if specified
        if (requiredMembers && requiredMembers.length > 0) {
          requiredMembers.forEach(memberId => {
            url += `&requiredMembers[]=${memberId}`;
          });
        }
        
        return url;
      },
      providesTags: (result, error, arg) => [
        { type: 'OptimalTimes', id: arg.bandId }
      ],
    }),
    
    // Set exception for a specific date
    setDateException: builder.mutation({
      query: (data) => ({
        url: '/availability/exception',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'UserAvailability', id: arg.bandId },
        { type: 'BandAvailability', id: arg.bandId }
      ],
    }),
    
    // Bulk import availability settings
    importAvailability: builder.mutation({
      query: (data) => ({
        url: '/availability/import',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'UserAvailability', id: arg.bandId },
        { type: 'BandAvailability', id: arg.bandId }
      ],
    }),
  }),
});

export const {
  useGetUserAvailabilityQuery,
  useGetBandAvailabilityQuery,
  useSetAvailabilityMutation,
  useUpdateAvailabilityMutation,
  useDeleteAvailabilityMutation,
  useFindOptimalTimesQuery,
  useSetDateExceptionMutation,
  useImportAvailabilityMutation,
} = availabilityApiSlice;