import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Dimensions, TextInput, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useCentralizedListener } from '../../hooks/use-centralized-listener';
import { BarChart } from '@/components/charts/BarChart';
import Svg, { Circle } from 'react-native-svg';

// Import Redux selectors and actions
import { 
  selectTrackingState,
  selectWeeklyProgress,
  selectSlides,
  selectCurrentSlideData,
  selectMaxHours,
  selectTrackingStats,
  selectTotalTasks,
  selectMaxPoints,
  selectTotalPoints,
  selectTimePeriodLabel,
  selectTimePeriodIcon,
  selectCustomDateFrom,
  selectCustomDateTo
} from '../../store/tracking/tracking.selector';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  handleNextSlide, 
  handlePrevSlide, 
  handleNavigateTimePeriod, 
  navigateTimePeriodWithData,
  handleCustomDateClick,
  handleCloseCustomDatePicker, 
  handleApplyCustomDateRange,
  createSampleData,
  setCustomDateFrom,
  setCustomDateTo,
  loadCustomDateRangeData,
  loadSnapshotDataForTimePeriod
} from '../../store/tracking/tracking.action';

// Import new components
import { TrackingHeader } from '../../components/tabscomponents/tracking/trackingHeader.component';
import { SummaryCard } from '../../components/tabscomponents/tracking/trackingSummaryCard.component';
import { TimePeriodSelector } from '../../components/tabscomponents/tracking/trackingTimePeriodSelector.component';
import { CustomDatePicker } from '../../components/tabscomponents/tracking/CustomDatePicker.component';
import { EmptyStateCard } from '../../components/tabscomponents/tracking/EmptyStateCard.component';
import { SimpleRealtimeService } from '../../src/services/simple-realtime';

const { height: screenHeight } = Dimensions.get('window');

export default function TrackingScreen() {
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  
  // Custom date picker state
  const [isLoadingCustomData, setIsLoadingCustomData] = useState(false);
  
  // Initialize only tracking-related listeners (following home/profile pattern)
  useCentralizedListener({
    enablePosts: false,
    enableUserData: false,     // Disabled - only use snapshot data for tracking
    enableTasks: false,
    enableLeaderboards: false,
    enableTrackingData: false, // Disabled - only use snapshot data (no database conflicts)
    enableSnapshots: false,    // Disabled - now using task snapshots only
    enableTaskSnapshots: true  // Enable task snapshots for all data
  });

  // Redux state - Use consolidated selector for better performance
  const trackingState = useSelector(selectTrackingState);
  const {
    // UI State
    currentSlide,
    timePeriod,
    showCustomDatePicker,
    isLoading,
    error,
    
    // Firebase Data
    trackingSessions,
    trackingAnalytics,
    weeklyProgressData,
    taskCompletionData,
    dailyPointsData,
    categoriesData
  } = trackingState;

  // Get custom date values
  const customDateFrom = useSelector(selectCustomDateFrom);
  const customDateTo = useSelector(selectCustomDateTo);
  
  // Get user ID from auth context (since we disabled userData listener)
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;

  // Load initial snapshot data when component mounts or user changes
  React.useEffect(() => {
    if (userId) {
      // Load snapshot data for the current time period
      dispatch(loadSnapshotDataForTimePeriod(userId, timePeriod));
    }
  }, [userId, timePeriod, dispatch]);

  // Use real data from Firebase
  const trackingData = categoriesData; // Categories data for the summary
  const weeklyProgress = weeklyProgressData; // Real weekly progress data
  const taskCompletion = taskCompletionData; // Task completion data
  const dailyPoints = dailyPointsData; // Daily points data
  
  // Debug: Log the actual data being used by UI components
  console.log('🔍 UI Data Check:', {
    weeklyProgress: weeklyProgress?.length || 0,
    taskCompletion: taskCompletion?.length || 0,
    dailyPoints: dailyPoints?.length || 0,
    categoriesData: categoriesData?.length || 0,
    sampleWeekly: weeklyProgress?.[0],
    sampleTask: taskCompletion?.[0],
    samplePoints: dailyPoints?.[0],
    sampleCategory: categoriesData?.[0]
  });
  
  // Filter data based on time period
  const getFilteredData = (data: any[], timePeriod: string) => {
    if (timePeriod === 'all-time') return data;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timePeriod) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return data;
    }
    
    return data.filter(item => {
      const itemDate = new Date(item.time || item.date || item.createdAt);
      return itemDate >= cutoffDate;
    });
  };
  
  // Get filtered data for current time period
  const filteredDailyPointsData = getFilteredData(dailyPointsData, timePeriod);
  
  // Get data limit based on time period
  const getDataLimit = (timePeriod: string) => {
    switch (timePeriod) {
      case 'week': return 7;
      case 'month': return 14;
      case 'year': return 30;
      case 'all-time': return 50;
      default: return 14;
    }
  };
  
  const dataLimit = getDataLimit(timePeriod);
  
  // Additional selectors for chart data
  const slides = useSelector(selectSlides);
  const currentSlideData = useSelector(selectCurrentSlideData);
  const maxHours = useSelector(selectMaxHours);
  const trackingStats = useSelector(selectTrackingStats);
  const totalTasks = useSelector(selectTotalTasks);
  const maxPoints = useSelector(selectMaxPoints);
  const totalPoints = useSelector(selectTotalPoints);
  const timePeriodLabel = useSelector(selectTimePeriodLabel);
  const timePeriodIcon = useSelector(selectTimePeriodIcon);

  const navigateTimePeriodUI = (direction: 'prev' | 'next') => {
    // Only update the UI state - useEffect will handle data fetching
    dispatch(navigateTimePeriodWithData(direction));
  };

  const onCustomDateClick = () => {
    dispatch(handleCustomDateClick());
  };

  const handleCreateSampleData = () => {
    dispatch(createSampleData());
  };

  // Check if there's data to display
  const hasData = () => {
    const hasWeeklyData = weeklyProgress && weeklyProgress.some((day: any) => (day.hours || 0) > 0);
    const hasTaskData = taskCompletion && taskCompletion.some((task: any) => (task.count || 0) > 0);
    const hasPointsData = dailyPoints && dailyPoints.some((point: any) => (point.points || 0) > 0);
    const hasCategoriesData = trackingData && trackingData.some((cat: any) => (cat.hours || 0) > 0);
    
    console.log('🔍 hasData check:', {
      hasWeeklyData,
      hasTaskData,
      hasPointsData,
      hasCategoriesData,
      weeklyProgressLength: weeklyProgress?.length || 0,
      taskCompletionLength: taskCompletion?.length || 0,
      dailyPointsLength: dailyPoints?.length || 0,
      trackingDataLength: trackingData?.length || 0
    });
    
    return hasWeeklyData || hasTaskData || hasPointsData || hasCategoriesData;
  };

  // Check if we're in custom date range mode
  const isCustomDateRange = customDateFrom && customDateTo;
  
  // Check if we should show empty state (custom date range OR time period navigation with no data)
  const shouldShowEmptyState = (isCustomDateRange || timePeriod !== 'week') && !hasData();

  // Custom date picker handlers
  const handleCustomDateApply = async (fromDate: string, toDate: string) => {
    try {
      setIsLoadingCustomData(true);
      
      // Update Redux state with selected dates
      dispatch(setCustomDateFrom(fromDate));
      dispatch(setCustomDateTo(toDate));
      dispatch(handleApplyCustomDateRange(fromDate, toDate));
      
      if (userId) {
        console.log('📅 Date range:', fromDate, 'to', toDate);
        
        // Process and update Redux state with snapshot data
        dispatch(loadCustomDateRangeData());
        
        console.log('✅ Custom date range data applied to UI');
      } else {
        console.warn('⚠️ No user ID available for custom date range query');
      }
      
    } catch (error) {
      console.error('❌ Error loading custom date range data:', error);
    } finally {
      setIsLoadingCustomData(false);
    }
  };


  const nextSlide = () => {
    dispatch(handleNextSlide());
  };

  const prevSlide = () => {
    dispatch(handlePrevSlide());
  };

  const renderBarChart = () => {
    // Convert weeklyProgress data to BarChart format
    const barChartData = weeklyProgress.map((day: any) => ({
      label: day.day,
      value: day.hours || 0,
      color: Colors[colorScheme ?? 'light'].tint,
    }));

    return (
      <BarChart
        data={barChartData}
        orientation="vertical"
        size="small"
        showValues={true}
        showLabels={true}
        enableHorizontalScroll={true}
        scrollThreshold={7}
        barWidth={50}
        formatValue={(value) => `${value.toFixed(1)}h`}
        style={styles.barChartContainer}
      />
    );
  };

  const renderPieChart = () => {

    return (
      <View style={styles.pieChartContainer}>
        <View style={styles.pieChart}>
          <View style={styles.pieChartInner}>
            <ThemedText style={styles.pieChartText}>{totalTasks}</ThemedText>
            <ThemedText style={styles.pieChartSubtext}>Total Tasks</ThemedText>
          </View>
          
          {/* Pie Chart using SVG */}
          <View style={styles.pieChartSemicircle}>
            {(() => {
              const completedData = taskCompletion.find((item: any) => item.category === 'Completed') || taskCompletion[0];
              const pendingData = taskCompletion.find((item: any) => item.category === 'Pending') || taskCompletion[1];
              
              const completedPercentage = completedData?.percentage || 0;
              const completedColor = completedData?.color || '#4CAF50';
              const pendingColor = pendingData?.color || '#FF5722';
              
              const radius = 50; // Circle radius
              const circumference = 2 * Math.PI * radius;
              const strokeDashoffset = circumference * (1 - completedPercentage / 100);
              
              return (
                <Svg width={120} height={120}>
                  {/* Background circle - Pending color */}
                  <Circle
                    cx={60}
                    cy={60}
                    r={radius}
                    stroke={pendingColor}
                    strokeWidth={20}
                    fill="none"
                  />
                  
                  {/* Completed progress circle - Green */}
                  <Circle
                    cx={60}
                    cy={60}
                    r={radius}
                    stroke={completedColor}
                    strokeWidth={20}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    rotation="-90"
                    origin="60, 60"
                  />
                </Svg>
              );
            })()}
          </View>
        </View>
        
        <View style={styles.pieLegend}>
          {taskCompletion.map((item: any) => (
            <View key={item.id} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <ThemedText style={styles.legendText}>{item.category}: {item.count} ({item.percentage}%)</ThemedText>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderLineChart = () => {
    console.log('🔍 Line Chart Data:', {
      totalPoints,
      maxPoints,
      filteredDailyPointsData: filteredDailyPointsData?.length || 0,
      samplePoint: filteredDailyPointsData?.[0],
      dataLimit
    });

    return (
      <View style={styles.lineChartContainer}>
        <View style={styles.pointsHeader}>
          <View style={styles.pointsSummary}>
            <ThemedText style={styles.pointsTotal}>{totalPoints}</ThemedText>
            <ThemedText style={styles.pointsLabel}>Points Earned Today</ThemedText>
          </View>
          <View style={styles.pointsGoal}>
            <ThemedText style={styles.goalText}>Goal: 100</ThemedText>
            <View style={styles.goalProgress}>
              <View style={[styles.goalProgressFill, { width: `${(totalPoints / 100) * 100}%` }]} />
            </View>
          </View>
        </View>

        <View style={styles.lineChart}>
          {filteredDailyPointsData.slice(-dataLimit).map((point: any, index: number) => {
            const slicedData = filteredDailyPointsData.slice(-dataLimit);
            const nextPoint = slicedData[index + 1];
            const height = maxPoints > 0 ? (point.points / maxPoints) * 80 : 0;
            const nextHeight = nextPoint && maxPoints > 0 ? (nextPoint.points / maxPoints) * 80 : height;
            
            return (
              <View key={index} style={styles.lineChartPoint}>
                <View style={[styles.pointDot, { 
                  backgroundColor: Colors[colorScheme ?? 'light'].tint,
                  bottom: height - 4
                }]} />
                <ThemedText style={styles.pointTime}>
                  {new Date(point.date || point.time).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </ThemedText>
                <ThemedText style={styles.pointValue}>{point.points}</ThemedText>
                
                {/* Connecting line */}
                {nextPoint && (
                  <View style={[styles.connectingLine, {
                    height: Math.abs(nextHeight - height),
                    bottom: Math.min(height, nextHeight),
                    backgroundColor: Colors[colorScheme ?? 'light'].tint,
                  }]} />
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.recentActivity}>
          <ThemedText style={styles.activityTitle}>Recent Activity</ThemedText>
          {filteredDailyPointsData.slice(-3).map((point: any, index: number) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityDot} />
              <ThemedText style={styles.activityText}>{point.activity}</ThemedText>
              <ThemedText style={styles.activityPoints}>+{point.points - (filteredDailyPointsData[filteredDailyPointsData.length - 4 + index]?.points || 0)}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Summary stats are now calculated in Redux selector

  // Show loading state if user is not authenticated yet
  if (!currentUser?.uid) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.loadingText}>Loading your tracking data...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container}>
        <TrackingHeader onCreateSampleData={handleCreateSampleData} />
      <SummaryCard 
        totalHours={trackingStats.totalHours}
        categories={trackingStats.categories}
        productivity={trackingStats.productivity}
      />

      <ThemedView style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <ThemedText type="subtitle" style={styles.cardTitle}>{currentSlideData.title}</ThemedText>
          <View style={styles.slideControls}>
            <TouchableOpacity style={styles.slideButton} onPress={prevSlide}>
              <ThemedText style={styles.slideButtonText}>‹</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.slideIndicator}>{currentSlide + 1}/{slides.length}</ThemedText>
            <TouchableOpacity style={styles.slideButton} onPress={nextSlide}>
              <ThemedText style={styles.slideButtonText}>›</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <TimePeriodSelector
          timePeriod={timePeriod}
          onNavigate={navigateTimePeriodUI}
          onCustomDateClick={onCustomDateClick}
          getTimePeriodLabel={() => timePeriodLabel}
          getTimePeriodIcon={() => timePeriodIcon}
        />
        
        {/* Show empty state if no data and in custom date range mode or different time period */}
        {shouldShowEmptyState ? (
          <EmptyStateCard
            fromDate={customDateFrom || ''}
            toDate={customDateTo || ''}
            isCustomDateRange={isCustomDateRange}
          />
        ) : (
          currentSlideData.type === 'bar' ? renderBarChart() : 
          currentSlideData.type === 'pie' ? renderPieChart() : renderLineChart()
        )}
      </ThemedView>

      <ThemedView style={styles.categoriesCard}>
        <ThemedText type="subtitle" style={styles.cardTitle}>Categories</ThemedText>
        {shouldShowEmptyState ? (
          <View style={styles.emptyCategoriesContainer}>
            <ThemedText style={styles.emptyCategoriesText}>
              No category data available for the selected {isCustomDateRange ? 'date range' : 'time period'}
            </ThemedText>
          </View>
        ) : (
          trackingData.map((item: any) => (
            <View key={item.id} style={styles.categoryItem}>
              <View style={styles.categoryLeft}>
                <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
                  <IconSymbol name={item.icon as any} size={20} color="white" />
                </View>
                <ThemedText style={styles.categoryName}>{item.category}</ThemedText>
              </View>
              <View style={styles.categoryRight}>
                <ThemedText type="defaultSemiBold">{(item.hours || 0).toFixed(1)}h</ThemedText>
              </View>
            </View>
          ))
        )}
      </ThemedView>

      {/* Custom Date Picker Modal */}
      <CustomDatePicker
        visible={showCustomDatePicker}
        onClose={() => dispatch(handleCloseCustomDatePicker())}
        onApply={handleCustomDateApply}
        initialFromDate={customDateFrom}
        initialToDate={customDateTo}
      />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
    color: '#666',
  },
  chartCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  cardTitle: {
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  slideControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slideButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  slideButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666666',
  },
  slideIndicator: {
    fontSize: 12,
    color: '#666666',
    marginHorizontal: 8,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    paddingTop: 20,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  bar: {
    width: 20,
    borderRadius: 10,
    marginBottom: 8,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  barValue: {
    fontSize: 10,
    opacity: 0.5,
    marginTop: 2,
  },
  categoriesCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  // Pie chart styles
  pieChartContainer: {
    alignItems: 'center',
    height: 200,
  },
  pieChart: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pieChartInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 2,
  },
  pieChartText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  pieChartSubtext: {
    fontSize: 10,
    color: '#666666',
    marginTop: 2,
  },
  pieChartSemicircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  pieLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666666',
  },
  // Line chart styles
  lineChartContainer: {
    minHeight: 280,
  },
  pointsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pointsSummary: {
    alignItems: 'center',
  },
  pointsTotal: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
  },
  pointsLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  pointsGoal: {
    alignItems: 'center',
  },
  goalText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  goalProgress: {
    width: 80,
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  lineChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 80,
    paddingHorizontal: 5,
    position: 'relative',
    marginBottom: 10,
  },
  lineChartPoint: {
    minWidth: 40,
    alignItems: 'center',
    position: 'relative',
    marginHorizontal: 2,
  },
  pointDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
  },
  pointTime: {
    fontSize: 9,
    color: '#666666',
    marginTop: 45,
    textAlign: 'center',
    maxWidth: 35,
  },
  pointValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
    marginTop: 2,
  },
  connectingLine: {
    position: 'absolute',
    width: 2,
    left: '50%',
    marginLeft: -1,
  },
  recentActivity: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
    marginRight: 8,
  },
  activityText: {
    fontSize: 12,
    color: '#666666',
    flex: 1,
  },
  activityPoints: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  // Full page overlay styles
  fullPageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Navigation styles
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    minWidth: 80,
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 5,
  },
  timePeriodLabel: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyCategoriesContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCategoriesText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  barChartContainer: {
    height: 160,
    marginVertical: 8,
  },
});