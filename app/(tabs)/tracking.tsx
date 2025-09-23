import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

// Import Redux selectors and actions
import { 
  selectTrackingData, 
  selectWeeklyProgress, 
  selectTaskCompletionData, 
  selectDailyPointsData, 
  selectCurrentSlide, 
  selectTimePeriod, 
  selectShowCustomDatePicker, 
  selectCustomDateFrom, 
  selectCustomDateTo,
  selectSlides,
  selectCurrentSlideData,
  selectMaxHours,
  selectTrackingStats,
  selectTotalTasks,
  selectMaxPoints,
  selectTotalPoints,
  selectTimePeriodLabel,
  selectTimePeriodIcon
} from '../../store/tracking/tracking.selector';
import { 
  handleNextSlide, 
  handlePrevSlide, 
  handleNavigateTimePeriod, 
  handleCustomDateClick, 
  handleCloseCustomDatePicker, 
  handleApplyCustomDateRange,
  setTimePeriodDirectly
} from '../../store/tracking/tracking.action';

// Import new components
import { TrackingHeader } from '../../components/tabscomponents/tracking/trackingHeader.component';
import { SummaryCard } from '../../components/tabscomponents/tracking/trackingSummaryCard.component';
import { TimePeriodSelector } from '../../components/tabscomponents/tracking/trackingTimePeriodSelector.component';

const { height: screenHeight } = Dimensions.get('window');

const screenWidth = Dimensions.get('window').width;

export default function TrackingScreen() {
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  
  // Redux state
  const trackingData = useSelector(selectTrackingData);
  const weeklyProgress = useSelector(selectWeeklyProgress);
  const taskCompletionData = useSelector(selectTaskCompletionData);
  const dailyPointsData = useSelector(selectDailyPointsData);
  const currentSlide = useSelector(selectCurrentSlide);
  const timePeriod = useSelector(selectTimePeriod);
  const showCustomDatePicker = useSelector(selectShowCustomDatePicker);
  const customDateFrom = useSelector(selectCustomDateFrom);
  const customDateTo = useSelector(selectCustomDateTo);
  const slides = useSelector(selectSlides);
  const currentSlideData = useSelector(selectCurrentSlideData);
  const maxHours = useSelector(selectMaxHours);
  const trackingStats = useSelector(selectTrackingStats);
  const totalTasks = useSelector(selectTotalTasks);
  const maxPoints = useSelector(selectMaxPoints);
  const totalPoints = useSelector(selectTotalPoints);
  const timePeriodLabel = useSelector(selectTimePeriodLabel);
  const timePeriodIcon = useSelector(selectTimePeriodIcon);

  const navigateTimePeriod = (direction: 'prev' | 'next') => {
    dispatch(handleNavigateTimePeriod(direction));
  };

  const handleCustomDateClick = () => {
    dispatch(handleCustomDateClick());
  };

  const nextSlide = () => {
    dispatch(handleNextSlide());
  };

  const prevSlide = () => {
    dispatch(handlePrevSlide());
  };

  const renderBarChart = () => (
    <View style={styles.chartContainer}>
      {weeklyProgress.map((day, index) => (
        <View key={index} style={styles.chartBar}>
          <View 
            style={[
              styles.bar, 
              { 
                height: (day.hours / maxHours) * 100,
                backgroundColor: Colors[colorScheme ?? 'light'].tint,
              }
            ]} 
          />
          <ThemedText style={styles.barLabel}>{day.day}</ThemedText>
          <ThemedText style={styles.barValue}>{day.hours}h</ThemedText>
        </View>
      ))}
    </View>
  );

  const renderPieChart = () => {

    return (
      <View style={styles.pieChartContainer}>
        <View style={styles.pieChart}>
          <View style={styles.pieChartInner}>
            <ThemedText style={styles.pieChartText}>{totalTasks}</ThemedText>
            <ThemedText style={styles.pieChartSubtext}>Total Tasks</ThemedText>
          </View>
          
          {/* Pie Chart using two semicircles */}
          <View style={styles.pieChartSemicircle}>
            {/* Top half - Completed (Green) */}
            <View style={[styles.pieHalf, styles.pieTopHalf, { backgroundColor: taskCompletionData[0]?.color || '#4CAF50' }]} />
            
            {/* Bottom half - Pending (Red/Orange) */}
            <View style={[styles.pieHalf, styles.pieBottomHalf, { backgroundColor: taskCompletionData[1]?.color || '#FF5722' }]} />
          </View>
        </View>
        
        <View style={styles.pieLegend}>
          {taskCompletionData.map((item) => (
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
          {dailyPointsData.map((point, index) => {
            const nextPoint = dailyPointsData[index + 1];
            const height = maxPoints > 0 ? (point.points / maxPoints) * 80 : 0;
            const nextHeight = nextPoint && maxPoints > 0 ? (nextPoint.points / maxPoints) * 80 : height;
            
            return (
              <View key={index} style={styles.lineChartPoint}>
                <View style={[styles.pointDot, { 
                  backgroundColor: Colors[colorScheme ?? 'light'].tint,
                  bottom: height - 4
                }]} />
                <ThemedText style={styles.pointTime}>{point.time.split(' ')[0]}</ThemedText>
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
          {dailyPointsData.slice(-3).map((point, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityDot} />
              <ThemedText style={styles.activityText}>{point.activity}</ThemedText>
              <ThemedText style={styles.activityPoints}>+{point.points - (dailyPointsData[dailyPointsData.length - 4 + index]?.points || 0)}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Summary stats are now calculated in Redux selector

  return (
    <ScrollView style={styles.container}>
      <TrackingHeader />
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
          onNavigate={navigateTimePeriod}
          onCustomDateClick={handleCustomDateClick}
          getTimePeriodLabel={() => timePeriodLabel}
          getTimePeriodIcon={() => timePeriodIcon}
        />
        
        {currentSlideData.type === 'bar' ? renderBarChart() : 
         currentSlideData.type === 'pie' ? renderPieChart() : renderLineChart()}
      </ThemedView>

      <ThemedView style={styles.categoriesCard}>
        <ThemedText type="subtitle" style={styles.cardTitle}>Categories</ThemedText>
        {trackingData.map((item) => (
          <View key={item.id} style={styles.categoryItem}>
            <View style={styles.categoryLeft}>
              <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
                <IconSymbol name={item.icon as any} size={20} color="white" />
              </View>
              <ThemedText style={styles.categoryName}>{item.category}</ThemedText>
            </View>
            <View style={styles.categoryRight}>
              <ThemedText type="defaultSemiBold">{item.hours}h</ThemedText>
              <View style={[styles.progressBar, { backgroundColor: 'rgba(0, 0, 0, 0.1)' }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${(item.hours / 10) * 100}%`,
                      backgroundColor: item.color,
                    }
                  ]} 
                />
              </View>
            </View>
          </View>
        ))}
      </ThemedView>

      {/* Custom Date Picker Overlay - Full Page */}
      {showCustomDatePicker && (
        <View style={styles.fullPageOverlay}>
          <TouchableOpacity 
            style={styles.overlayBackground}
            onPress={() => dispatch(handleCloseCustomDatePicker())}
            activeOpacity={1}
          >
            <View style={styles.customDatePicker}>
              <View style={styles.customDateHeader}>
                <ThemedText style={styles.customDateTitle}>Custom Date Range</ThemedText>
                <TouchableOpacity 
                  style={styles.closeButtonContainer}
                  onPress={() => dispatch(handleCloseCustomDatePicker())}
                >
                  <ThemedText style={styles.closeButton}>✕</ThemedText>
                </TouchableOpacity>
              </View>
              
              <View style={styles.dateInputs}>
                <View style={styles.dateInputGroup}>
                  <ThemedText style={styles.dateLabel}>From</ThemedText>
                  <TouchableOpacity style={styles.dateButton}>
                    <ThemedText style={styles.dateButtonText}>2024-01-01</ThemedText>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.dateInputGroup}>
                  <ThemedText style={styles.dateLabel}>To</ThemedText>
                  <TouchableOpacity style={styles.dateButton}>
                    <ThemedText style={styles.dateButtonText}>2024-01-31</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.customDateActions}>
                <TouchableOpacity 
                  style={styles.applyButton}
                  onPress={() => {
                    dispatch(handleApplyCustomDateRange('2024-01-01', '2024-01-31'));
                  }}
                >
                  <ThemedText style={styles.applyButtonText}>Apply</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => dispatch(handleCloseCustomDatePicker())}
                >
                  <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  progressBar: {
    width: 60,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
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
  pieHalf: {
    width: 120,
    height: 60,
    position: 'absolute',
    left: 0,
  },
  pieTopHalf: {
    top: 0,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
  },
  pieBottomHalf: {
    bottom: 0,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
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
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
    paddingHorizontal: 10,
    position: 'relative',
    marginBottom: 10,
  },
  lineChartPoint: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  pointDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
  },
  pointTime: {
    fontSize: 10,
    color: '#666666',
    marginTop: 45,
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
  // Custom date picker styles
  customDatePicker: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    width: '90%',
    maxWidth: 320,
  },
  customDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  customDateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  closeButtonContainer: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  closeButton: {
    fontSize: 18,
    color: '#666666',
    fontWeight: 'bold',
  },
  dateInputs: {
    marginBottom: 20,
  },
  dateInputGroup: {
    marginBottom: 12,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 6,
  },
  dateButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  dateButtonText: {
    fontSize: 14,
    color: '#333333',
  },
  customDateActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});